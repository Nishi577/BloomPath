import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
    MessageSquare,
    Users,
    Send,
    Search,
    Heart,
    MoreVertical,
    Image as ImageIcon,
    Smile,
    ShieldCheck,
    User
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

interface ChatMessage {
    id: string;
    user_name: string;
    text: string;
    timestamp: string;
    is_verified: boolean;
    avatar?: string;
    likes: number;
}

const Community = () => {
    const navigate = useNavigate();
    const { user, profile, loading } = useAuth();
    const [messages, setMessages] = useState<ChatMessage[]>([
        {
            id: "1",
            user_name: "Anita Sharma",
            text: "Has anyone tried the tailoring jobs in South Delhi? Looking for some feedback!",
            timestamp: "10:30 AM",
            is_verified: true,
            likes: 12
        },
        {
            id: "2",
            user_name: "Priya Patel",
            text: "Yes Anita! I worked with the boutique there last week. They are great and pay on time.",
            timestamp: "10:35 AM",
            is_verified: true,
            likes: 8
        },
        {
            id: "3",
            user_name: "Meera Reddy",
            text: "Can someone help me with the Aadhar verification? My photo is a bit blurry.",
            timestamp: "11:05 AM",
            is_verified: false,
            likes: 2
        },
        {
            id: "4",
            user_name: "BloomPath Admin",
            text: "Hi Meera! Please try to take a photo in natural light. If it still fails, our support team can help you manually.",
            timestamp: "11:10 AM",
            is_verified: true,
            likes: 15
        }
    ]);
    const [newMessage, setNewMessage] = useState("");
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!loading && !user) {
            navigate("/auth");
        }
    }, [user, loading, navigate]);

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        const msg: ChatMessage = {
            id: Date.now().toString(),
            user_name: profile?.full_name || "Guest User",
            text: newMessage,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            is_verified: profile?.is_verified || false,
            likes: 0
        };

        setMessages([...messages, msg]);
        setNewMessage("");
    };

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Navbar />

            <main className="flex-1 container mx-auto px-4 py-8 flex flex-col md:flex-row gap-8">
                {/* Sidebar - Stats & Info */}
                <div className="w-full md:w-80 flex flex-col gap-6">
                    <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                                <Users className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                                <h2 className="font-display font-bold text-xl">Community</h2>
                                <p className="text-xs text-muted-foreground">BloomPath Hub</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Online Now</span>
                                <span className="font-semibold flex items-center gap-1.5">
                                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                    1,248
                                </span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Verified Members</span>
                                <span className="font-semibold">8,420</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Solved Questions</span>
                                <span className="font-semibold text-primary">15.5k</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20 rounded-2xl p-6">
                        <h3 className="font-semibold mb-2 flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4 text-primary" />
                            Safety First
                        </h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                            BloomPath Community is a safe space for women. Please be respectful and help each other grow. Avoid sharing personal contact details in public chat.
                        </p>
                    </div>
                </div>

                {/* Main Chat Area */}
                <div className="flex-1 bg-card border border-border rounded-2xl shadow-xl flex flex-col overflow-hidden max-h-[80vh]">
                    {/* Chat Header */}
                    <div className="p-4 border-b border-border flex items-center justify-between bg-muted/30">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                                <MessageSquare className="w-5 h-5 text-primary-foreground" />
                            </div>
                            <div>
                                <h3 className="font-semibold">General Discussion</h3>
                                <p className="text-xs text-muted-foreground">Ask questions, share experiences</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button variant="ghost" size="icon"><Search className="w-4 h-4" /></Button>
                            <Button variant="ghost" size="icon"><MoreVertical className="w-4 h-4" /></Button>
                        </div>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-6 scroll-smooth" ref={scrollRef}>
                        <div className="space-y-6">
                            {messages.map((msg) => (
                                <motion.div
                                    key={msg.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="flex gap-4"
                                >
                                    <Avatar className="w-10 h-10 border border-border">
                                        <AvatarFallback className="bg-primary/5 text-primary">
                                            {msg.user_name[0]}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 space-y-1">
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold text-sm">{msg.user_name}</span>
                                            {msg.is_verified && (
                                                <Badge variant="secondary" className="bg-blue-500/10 text-blue-500 text-[10px] h-4 px-1 px-1 gap-1">
                                                    <ShieldCheck className="w-3 h-3" />
                                                    Verified
                                                </Badge>
                                            )}
                                            <span className="text-[10px] text-muted-foreground">{msg.timestamp}</span>
                                        </div>
                                        <div className="bg-muted/50 rounded-2xl rounded-tl-none p-3 text-sm text-foreground/90 border border-border/50">
                                            {msg.text}
                                        </div>
                                        <div className="flex items-center gap-4 mt-2">
                                            <button className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-primary transition-colors">
                                                <Heart className="w-3.5 h-3.5" />
                                                {msg.likes} Likes
                                            </button>
                                            <button className="text-[11px] text-muted-foreground hover:text-primary transition-colors">
                                                Reply
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* Input Area */}
                    <div className="p-4 border-t border-border bg-background">
                        <form onSubmit={handleSendMessage} className="flex flex-col gap-3">
                            <div className="relative">
                                <Input
                                    placeholder="Type your question or message..."
                                    className="pr-24 py-6 rounded-xl border-2 focus:ring-primary/20"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                />
                                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                                    <Button type="button" variant="ghost" size="icon" className="h-9 w-9">
                                        <ImageIcon className="w-4 h-4 text-muted-foreground" />
                                    </Button>
                                    <Button type="button" variant="ghost" size="icon" className="h-9 w-9">
                                        <Smile className="w-4 h-4 text-muted-foreground" />
                                    </Button>
                                    <Button type="submit" size="sm" className="btn-primary-glow px-4 h-9" disabled={!newMessage.trim()}>
                                        <Send className="w-4 h-4 mr-2" />
                                        Send
                                    </Button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default Community;
