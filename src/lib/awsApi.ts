// AWS API Client - replaces Supabase
// All API calls go through API Gateway with Cognito JWT auth

const API_URL = import.meta.env.VITE_API_URL || "";

export const getAuthToken = (): string | null => {
  return localStorage.getItem("bloompath_id_token");
};

export const setAuthTokens = (idToken: string, accessToken: string, refreshToken: string) => {
  localStorage.setItem("bloompath_id_token", idToken);
  localStorage.setItem("bloompath_access_token", accessToken);
  localStorage.setItem("bloompath_refresh_token", refreshToken);
};

export const clearAuthTokens = () => {
  localStorage.removeItem("bloompath_id_token");
  localStorage.removeItem("bloompath_access_token");
  localStorage.removeItem("bloompath_refresh_token");
};

const authHeaders = (): Record<string, string> => {
  const token = getAuthToken();
  return token
    ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }
    : { "Content-Type": "application/json" };
};

// ─── Jobs API ────────────────────────────────────────────────────────────────

export const jobsApi = {
  list: async (filters?: { organizationType?: string; status?: string }) => {
    const params = new URLSearchParams();
    if (filters?.organizationType) params.set("organizationType", filters.organizationType);
    if (filters?.status) params.set("status", filters.status);

    const res = await fetch(`${API_URL}/jobs?${params.toString()}`);
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  create: async (data: {
    title: string;
    description: string;
    organizationType: "ngo" | "shg";
    requiredSkills?: string[];
    locationType?: string;
    payPerUnit?: number;
    pieceRate?: number;
    deadline?: string;
  }) => {
    const res = await fetch(`${API_URL}/jobs`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },
};

// ─── Applications API ─────────────────────────────────────────────────────────

export const applicationsApi = {
  apply: async (data: { jobId: string; piecesRequested?: number; coverNote?: string }) => {
    const res = await fetch(`${API_URL}/apply`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },
};

// ─── NGO API ──────────────────────────────────────────────────────────────────

export const ngoApi = {
  create: async (data: {
    organizationName: string;
    registrationNumber: string;
    focusArea?: string;
    location?: string;
    contactPerson?: string;
    contactEmail: string;
    description?: string;
    website?: string;
  }) => {
    const res = await fetch(`${API_URL}/ngo/create`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },
};

// ─── SHG API ──────────────────────────────────────────────────────────────────

export const shgApi = {
  create: async (data: {
    groupName: string;
    registrationNumber: string;
    district: string;
    state: string;
    contactPerson?: string;
    mobile?: string;
    membersCount?: number;
    specialization?: string;
    description?: string;
    bankAccount?: string;
  }) => {
    const res = await fetch(`${API_URL}/shg/create`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },
};

// ─── AI API ───────────────────────────────────────────────────────────────────

export const aiApi = {
  suggest: async (data: { prompt: string; context?: string }) => {
    const res = await fetch(`${API_URL}/ai/suggest`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },
};

// ─── Upload API ───────────────────────────────────────────────────────────────

export const uploadApi = {
  getPresignedUrl: async (data: {
    fileType: string;
    uploadType: "resume" | "ngo_verification" | "shg_document" | "work_proof" | "avatar" | "id_proof";
    fileName?: string;
  }) => {
    const res = await fetch(`${API_URL}/upload-url`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  uploadFile: async (uploadUrl: string, file: File) => {
    const res = await fetch(uploadUrl, {
      method: "PUT",
      body: file,
      headers: { "Content-Type": file.type },
    });
    if (!res.ok) throw new Error("Upload failed");
    return true;
  },
};

// ─── Profile API ──────────────────────────────────────────────────────────────

export const profileApi = {
  createJobSeekerProfile: async (data: {
    name: string;
    age?: number;
    location: string;
    education?: string;
    skills?: string[];
    workPreferences?: string[];
    familyConstraints?: boolean;
    emergencyContact?: { name: string; phone: string } | null;
    idProofUrl?: string;
  }) => {
    const res = await fetch(`${API_URL}/createJobSeekerProfile`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  createEmployerProfile: async (data: {
    employerType: "shg" | "small_business";
    shgName?: string;
    registrationId?: string;
    leaderDetails?: object;
    workType?: string[];
    businessName?: string;
    gstOrBusinessId?: string;
    verificationDocUrl?: string;
  }) => {
    const res = await fetch(`${API_URL}/createEmployerProfile`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  createNGOProfile: async (data: {
    ngoName: string;
    registrationNumber: string;
    trainingType?: string[];
    verificationDocUrl?: string;
    contactPerson?: string;
    location?: string;
  }) => {
    const res = await fetch(`${API_URL}/createNGOProfile`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  getProfile: async () => {
    const res = await fetch(`${API_URL}/getProfile`, { headers: authHeaders() });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  updateProfile: async (data: Record<string, unknown>) => {
    const res = await fetch(`${API_URL}/updateProfile`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },
};

// ─── MicroJob API ─────────────────────────────────────────────────────────────

export const microJobApi = {
  create: async (data: {
    title: string;
    description: string;
    category?: string;
    ratePerPiece: number;
    shgMargin?: number;
    minPieces?: number;
    totalPiecesAvailable?: number;
    requiredSkills?: string[];
    samplePhotoUrl?: string;
    deadline?: string;
  }) => {
    const res = await fetch(`${API_URL}/createMicroJob`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  approveWorker: async (data: { applicationId: string; action: "approve" | "reject" }) => {
    const res = await fetch(`${API_URL}/approveWorker`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  completeTask: async (data: { applicationId: string; piecesCompleted: number; proofUrl?: string }) => {
    const res = await fetch(`${API_URL}/completeTask`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  getWorkerTasks: async () => {
    const res = await fetch(`${API_URL}/workerTasks`, { headers: authHeaders() });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },
};

// ─── Training API ─────────────────────────────────────────────────────────────

export const trainingApi = {
  createModule: async (data: {
    title: string;
    category: string;
    description?: string;
    durationHours?: number;
    skillScoreBoost?: number;
    difficulty?: string;
    language?: string;
    contentUrl?: string;
  }) => {
    const res = await fetch(`${API_URL}/createTrainingModule`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  getModules: async () => {
    const res = await fetch(`${API_URL}/trainingModules`);
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  assignCounsellor: async (data: {
    counsellorName?: string;
    counsellorEmail: string;
    moduleId: string;
    schedule?: string;
    learnerId?: string;
  }) => {
    const res = await fetch(`${API_URL}/assignCounsellor`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  getLearnerProgress: async (learnerId?: string) => {
    const url = learnerId ? `${API_URL}/learnerProgress?learnerId=${learnerId}` : `${API_URL}/learnerProgress`;
    const res = await fetch(url, { headers: authHeaders() });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },
};

// ─── Analytics API ────────────────────────────────────────────────────────────

export const analyticsApi = {
  get: async (role?: string) => {
    const url = role ? `${API_URL}/analytics?role=${role}` : `${API_URL}/analytics`;
    const res = await fetch(url, { headers: authHeaders() });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },
};

// ─── Admin API ────────────────────────────────────────────────────────────────

export const adminApi = {
  getData: async () => {
    const res = await fetch(`${API_URL}/admin/users`, { headers: authHeaders() });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  action: async (payload: Record<string, unknown>) => {
    const res = await fetch(`${API_URL}/admin/action`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },
};