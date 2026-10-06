import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, X, MessageCircle, Volume2, Loader2, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

const VoiceAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [transcript, setTranscript] = useState('');
  const [inputText, setInputText] = useState('');

  const navigate = useNavigate();
  const location = useLocation();
  const { user, profile } = useAuth();

  // Speech recognition setup
  const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  const recognition = SpeechRecognition ? new SpeechRecognition() : null;
  const synthesis = window.speechSynthesis;

  useEffect(() => {
    if (recognition) {
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-IN';

      recognition.onresult = (event: any) => {
        const current = event.resultIndex;
        const result = event.results[current];
        const transcriptText = result[0].transcript;
        setTranscript(transcriptText);

        if (result.isFinal) {
          handleUserInput(transcriptText);
          setTranscript('');
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };
    }
  }, []);

  const speak = useCallback((text: string) => {
    if (synthesis) {
      synthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-IN';
      utterance.rate = 1;
      utterance.pitch = 1.1;

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);

      synthesis.speak(utterance);
    }
  }, [synthesis]);

  const addMessage = (text: string, isUser: boolean) => {
    const message: Message = {
      id: Date.now().toString(),
      text,
      isUser,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, message]);
  };

  const handleUserInput = (input: string) => {
    const lowerInput = input.toLowerCase().trim();
    addMessage(input, true);
    setIsProcessing(true);

    setTimeout(() => {
      let response = '';

      // Navigation commands
      if (lowerInput.includes('profile') || lowerInput.includes('my profile')) {
        response = "Taking you to your profile page where you can update your details and verify your Aadhar.";
        navigate('/profile');
      } else if (lowerInput.includes('job') && (lowerInput.includes('find') || lowerInput.includes('browse') || lowerInput.includes('search'))) {
        response = "Opening the jobs section. You can browse available opportunities and filter by location and skills.";
        navigate('/jobs');
      } else if (lowerInput.includes('counsellor') || lowerInput.includes('counselor') || lowerInput.includes('guidance') || lowerInput.includes('help me')) {
        response = "Taking you to our counsellor section where you can book sessions with career experts.";
        navigate('/counsellor');
      } else if (lowerInput.includes('skill') || lowerInput.includes('skills')) {
        response = "Opening the skills section where you can manage your skills and get recommendations.";
        navigate('/skills');
      } else if (lowerInput.includes('my work') || lowerInput.includes('work') || lowerInput.includes('application')) {
        response = "Showing your work dashboard where you can track applications and submit completed tasks.";
        navigate('/my-work');
      } else if (lowerInput.includes('home') || lowerInput.includes('go back')) {
        response = "Taking you back to the home page.";
        navigate('/');
      } else if (lowerInput.includes('employer') && profile?.role === 'business') {
        response = "Opening your employer dashboard where you can post jobs and review applications.";
        navigate('/employer');
      }
      // Help commands
      else if (lowerInput.includes('how') && lowerInput.includes('post') && lowerInput.includes('work')) {
        response = "To post your work: First, apply for a job from the Jobs section. Once accepted, go to My Work section and click Submit Work to upload your completed task.";
      } else if (lowerInput.includes('how') && lowerInput.includes('apply')) {
        response = "To apply for a job: Go to the Jobs section, find a suitable job, and click Apply Now. Make sure your profile is complete and verified.";
      } else if (lowerInput.includes('how') && lowerInput.includes('verify') || lowerInput.includes('verification')) {
        response = "To get verified: Go to your Profile page and upload a clear image of your Aadhar card. Our team will verify it within 24 hours.";
      } else if (lowerInput.includes('check') && lowerInput.includes('application')) {
        response = "You can check your job applications in the My Work section. It shows all in-progress, submitted, and verified tasks.";
      }
      // Greetings and general
      else if (lowerInput.includes('hello') || lowerInput.includes('hi') || lowerInput.includes('hey')) {
        const greeting = user ? `Hello ${profile?.full_name || 'there'}! ` : 'Hello! ';
        response = greeting + "I'm Sakhi, your BloomPath assistant. How can I help you today? You can ask me to navigate to any section or get help with using the app.";
      } else if (lowerInput.includes('thank')) {
        response = "You're welcome! Feel free to ask if you need any more help.";
      } else if (lowerInput.includes('what') && (lowerInput.includes('is') || lowerInput.includes('app')) && (lowerInput.includes('bloompath') || lowerInput.includes('this'))) {
        response = "BloomPath is a dedicated platform for women in India to find flexible, location-based jobs and build professional skills. We help you earn while balancing your home life.";
      } else if (lowerInput.includes('how') && (lowerInput.includes('earn') || lowerInput.includes('money'))) {
        response = "You can earn money by completing tasks and jobs posted on BloomPath. Find a job that matches your skills in the 'Jobs' section, apply, and once approved, submit your work to get paid.";
      } else if (lowerInput.includes('who') && lowerInput.includes('are') && lowerInput.includes('you')) {
        response = "I am Sakhi, your AI voice assistant for BloomPath. I can help you find jobs, navigate the platform, or answer questions about how it works.";
      } else if (lowerInput.includes('what can you do') || lowerInput.includes('help')) {
        response = "I can help you navigate the app, find jobs, check your profile, book counsellor sessions, manage skills, and guide you on how to post work or apply for jobs. Just ask!";
      }
      // Admin commands (only for admin users)
      else if (lowerInput.includes('admin') && profile?.role === 'admin') {
        response = "Opening the admin portal for user management and work verification.";
        navigate('/admin-portal');
      }
      // Default response
      else {
        response = "I'm listening. You can ask me to navigate to the 'Jobs' section, check your 'Work', or ask how to get verified on BloomPath. What would you like to do?";
      }

      addMessage(response, false);
      speak(response);
      setIsProcessing(false);
    }, 500);
  };

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;
    handleUserInput(inputText);
    setInputText('');
  };

  const toggleListening = () => {
    if (!recognition) {
      addMessage("Sorry, speech recognition is not supported in your browser.", false);
      return;
    }

    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      recognition.start();
      setIsListening(true);
    }
  };

  const handleOpen = () => {
    setIsOpen(true);
    if (messages.length === 0) {
      const welcomeMessage = user
        ? `Hi ${profile?.full_name || 'there'}! I'm Sakhi, your BloomPath assistant. How can I help you today?`
        : "Hi! I'm Sakhi, your BloomPath assistant. How can I help you navigate the app?";
      addMessage(welcomeMessage, false);
      speak(welcomeMessage);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <motion.button
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-colors ${isOpen ? 'bg-muted' : 'bg-primary voice-assistant-pulse'
          }`}
        onClick={() => isOpen ? setIsOpen(false) : handleOpen()}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        {isOpen ? (
          <X className="w-6 h-6 text-foreground" />
        ) : (
          <MessageCircle className="w-6 h-6 text-primary-foreground" />
        )}
      </motion.button>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 right-6 z-50 w-80 md:w-96 bg-card border border-border rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="bg-primary p-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full bg-primary-foreground/20 flex items-center justify-center ${isSpeaking ? 'voice-listening' : ''}`}>
                  <Volume2 className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold text-primary-foreground">Sakhi</h3>
                  <p className="text-xs text-primary-foreground/80">Your BloomPath Assistant</p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="h-64 overflow-y-auto p-4 space-y-3">
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-2xl text-sm ${msg.isUser
                      ? 'bg-primary text-primary-foreground rounded-br-sm'
                      : 'bg-muted text-foreground rounded-bl-sm'
                      }`}
                  >
                    {msg.text}
                  </div>
                </motion.div>
              ))}

              {/* Transcript while listening */}
              {transcript && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-end"
                >
                  <div className="max-w-[80%] p-3 rounded-2xl text-sm bg-primary/50 text-primary-foreground rounded-br-sm italic">
                    {transcript}...
                  </div>
                </motion.div>
              )}

              {isProcessing && (
                <div className="flex justify-start">
                  <div className="bg-muted p-3 rounded-2xl rounded-bl-sm">
                    <Loader2 className="w-4 h-4 animate-spin text-primary" />
                  </div>
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-border bg-background">
              <form onSubmit={handleSendMessage} className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="Type a message..."
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    type="submit"
                    size="icon"
                    className="shrink-0"
                    disabled={!inputText.trim() || isProcessing}
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    onClick={toggleListening}
                    variant={isListening ? "destructive" : "outline"}
                    className="flex-1 flex items-center justify-center gap-2 h-9"
                  >
                    {isListening ? (
                      <>
                        <MicOff className="w-4 h-4" />
                        Stop
                      </>
                    ) : (
                      <>
                        <Mic className="w-4 h-4" />
                        Speak
                      </>
                    )}
                  </Button>
                </div>
              </form>
              <p className="text-[10px] text-center text-muted-foreground mt-2">
                {isListening ? 'Listening...' : 'Type or speak to Sakhi for help'}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default VoiceAssistant;
