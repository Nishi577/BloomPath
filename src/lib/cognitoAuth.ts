// AWS Cognito Auth Client - replaces Supabase auth
// Uses Cognito USER_PASSWORD_AUTH flow via REST API

const REGION = import.meta.env.VITE_AWS_REGION || "us-east-1";
const CLIENT_ID = import.meta.env.VITE_COGNITO_CLIENT_ID || "";
const COGNITO_ENDPOINT = `https://cognito-idp.${REGION}.amazonaws.com/`;

const cognitoRequest = async (target: string, body: object) => {
  const res = await fetch(COGNITO_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-amz-json-1.1",
      "X-Amz-Target": `AWSCognitoIdentityProviderService.${target}`,
    },
    body: JSON.stringify(body),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || data.__type || "Cognito error");
  }
  return data;
};

export interface CognitoUser {
  sub: string;
  email: string;
  name?: string;
  role?: string;
}

export interface AuthTokens {
  idToken: string;
  accessToken: string;
  refreshToken: string;
}

// Parse JWT payload (no verification - server does that)
const parseJwt = (token: string): Record<string, string> => {
  try {
    const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(base64));
  } catch {
    return {};
  }
};

export const cognitoAuth = {
  signUp: async (
    email: string,
    password: string,
    attributes: { name?: string; role?: string } = {}
  ): Promise<{ userSub: string }> => {
    const userAttributes = [{ Name: "email", Value: email }];
    if (attributes.name) userAttributes.push({ Name: "name", Value: attributes.name });
    if (attributes.role) userAttributes.push({ Name: "custom:role", Value: attributes.role });

    const data = await cognitoRequest("SignUp", {
      ClientId: CLIENT_ID,
      Username: email,
      Password: password,
      UserAttributes: userAttributes,
    });

    return { userSub: data.UserSub };
  },

  confirmSignUp: async (email: string, code: string): Promise<void> => {
    await cognitoRequest("ConfirmSignUp", {
      ClientId: CLIENT_ID,
      Username: email,
      ConfirmationCode: code,
    });
  },

  signIn: async (email: string, password: string): Promise<AuthTokens & { user: CognitoUser }> => {
    const data = await cognitoRequest("InitiateAuth", {
      AuthFlow: "USER_PASSWORD_AUTH",
      ClientId: CLIENT_ID,
      AuthParameters: {
        USERNAME: email,
        PASSWORD: password,
      },
    });

    const result = data.AuthenticationResult;
    const tokens: AuthTokens = {
      idToken: result.IdToken,
      accessToken: result.AccessToken,
      refreshToken: result.RefreshToken,
    };

    const payload = parseJwt(result.IdToken);
    const user: CognitoUser = {
      sub: payload.sub,
      email: payload.email,
      name: payload.name || payload["custom:name"],
      role: payload["custom:role"],
    };

    // Persist tokens
    localStorage.setItem("bloompath_id_token", tokens.idToken);
    localStorage.setItem("bloompath_access_token", tokens.accessToken);
    localStorage.setItem("bloompath_refresh_token", tokens.refreshToken);
    localStorage.setItem("bloompath_user", JSON.stringify(user));

    return { ...tokens, user };
  },

  signOut: (): void => {
    localStorage.removeItem("bloompath_id_token");
    localStorage.removeItem("bloompath_access_token");
    localStorage.removeItem("bloompath_refresh_token");
    localStorage.removeItem("bloompath_user");
  },

  getCurrentUser: (): CognitoUser | null => {
    try {
      const raw = localStorage.getItem("bloompath_user");
      if (!raw) return null;
      const user = JSON.parse(raw) as CognitoUser;
      const token = localStorage.getItem("bloompath_id_token");
      if (!token) return null;
      const payload = parseJwt(token);
      // If expired, trigger background refresh but still return user for now
      if (payload.exp && parseInt(payload.exp, 10) * 1000 < Date.now()) {
        cognitoAuth.refreshSession(); // async, runs in background
      }
      return user;
    } catch {
      return null;
    }
  },

  getIdToken: (): string | null => {
    const token = localStorage.getItem("bloompath_id_token");
    if (!token) return null;
    const payload = parseJwt(token);
    // If token expires within 60 seconds, refresh in background
    if (payload.exp && parseInt(payload.exp, 10) * 1000 < Date.now() + 60000) {
      cognitoAuth.refreshSession();
    }
    return token;
  },

  refreshSession: async (): Promise<AuthTokens | null> => {
    const refreshToken = localStorage.getItem("bloompath_refresh_token");
    if (!refreshToken) return null;

    try {
      const data = await cognitoRequest("InitiateAuth", {
        AuthFlow: "REFRESH_TOKEN_AUTH",
        ClientId: CLIENT_ID,
        AuthParameters: { REFRESH_TOKEN: refreshToken },
      });

      const result = data.AuthenticationResult;
      localStorage.setItem("bloompath_id_token", result.IdToken);
      localStorage.setItem("bloompath_access_token", result.AccessToken);

      return {
        idToken: result.IdToken,
        accessToken: result.AccessToken,
        refreshToken,
      };
    } catch {
      cognitoAuth.signOut();
      return null;
    }
  },

  forgotPassword: async (email: string): Promise<void> => {
    await cognitoRequest("ForgotPassword", { ClientId: CLIENT_ID, Username: email });
  },

  confirmForgotPassword: async (email: string, code: string, newPassword: string): Promise<void> => {
    await cognitoRequest("ConfirmForgotPassword", {
      ClientId: CLIENT_ID,
      Username: email,
      ConfirmationCode: code,
      Password: newPassword,
    });
  },
};