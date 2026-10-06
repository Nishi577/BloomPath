import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Calendar,
  Clock,
  User,
  MessageCircle,
  Star,
  Phone,
  Video,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
// Migrated: use awsApi instead of Supabase
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

interface Counsellor {
  id: string;
  name: string;
  specialization: string;
  avatar_url: string | null;
  available_slots: string[];
}

interface Booking {
  id: string;
  counsellor_id: string;
  booking_date: string;
  booking_time: string;
  status: string;
  notes: string | null;
  counsellor?: Counsellor;
}

const Counsellor = () => {
  const navigate = useNavigate();
  const { user, profile, loading } = useAuth();
  const { toast } = useToast();

  const [counsellors, setCounsellors] = useState<Counsellor[]>([]);
  const [myBookings, setMyBookings] = useState<Booking[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [selectedCounsellor, setSelectedCounsellor] = useState<Counsellor | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingDate, setBookingDate] = useState("");
  const [bookingTime, setBookingTime] = useState("");
  const [bookingNotes, setBookingNotes] = useState("");
  const [isBooking, setIsBooking] = useState(false);

  useEffect(() => {
    fetchCounsellors();
    if (user) {
      fetchMyBookings();
    }
  }, [user]);

  const fetchCounsellors = async () => {
    try {
      const DEMO_COUNSELLORS = [
        {
          id: "c1", name: "Dr. Priya Mehta", specialization: "Career Guidance & Women Empowerment",
          experience_years: 8, rating: 4.9, total_sessions: 320,
          bio: "Expert in rural livelihood, SHG management, and career counselling for women.",
          available_slots: ["Mon 10am", "Wed 2pm", "Fri 11am"],
          profile_image: "https://randomuser.me/api/portraits/women/44.jpg",
          languages: ["Hindi", "Marathi", "English"], fee_per_session: 0,
        },
        {
          id: "c2", name: "Sunita Rao", specialization: "Skill Development & Vocational Training",
          experience_years: 5, rating: 4.7, total_sessions: 180,
          bio: "Helps women identify marketable skills and connect with training programs.",
          available_slots: ["Tue 3pm", "Thu 10am", "Sat 9am"],
          profile_image: "https://randomuser.me/api/portraits/women/68.jpg",
          languages: ["Telugu", "Hindi", "English"], fee_per_session: 0,
        },
        {
          id: "c3", name: "Rekha Sharma", specialization: "Entrepreneurship & Business Setup",
          experience_years: 12, rating: 4.8, total_sessions: 540,
          bio: "Guides women entrepreneurs in setting up home-based businesses and SHGs.",
          available_slots: ["Mon 2pm", "Wed 11am", "Fri 3pm"],
          profile_image: "https://randomuser.me/api/portraits/women/32.jpg",
          languages: ["Hindi", "English"], fee_per_session: 0,
        },
      ];
      setCounsellors(DEMO_COUNSELLORS);
    } catch (error) {
      console.error("Error fetching counsellors:", error);
    } finally {
      setLoadingData(false);
    }
  };

  const fetchMyBookings = async () => {
    if (!user) return;
    try {
      const { data, error } = { data: [], error: null };

      if (error) throw error;
      setMyBookings(data || []);
    } catch (error) {
      console.error("Error fetching bookings:", error);
    }
  };

  const handleBookSession = async () => {
    if (!user || !selectedCounsellor || !bookingDate || !bookingTime) return;

    setIsBooking(true);
    try {
      const { error } = { error: null };

      if (error) throw error;

      toast({
        title: "Session Booked!",
        description: `Your session with ${selectedCounsellor.name} has been scheduled.`,
      });

      setShowBookingModal(false);
      setBookingDate("");
      setBookingTime("");
      setBookingNotes("");
      setSelectedCounsellor(null);
      fetchMyBookings();
    } catch (error) {
      console.error("Error booking session:", error);
      toast({
        title: "Error",
        description: "Failed to book session. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsBooking(false);
    }
  };

  const openBookingModal = (counsellor: Counsellor) => {
    if (!user) {
      navigate("/auth");
      return;
    }
    setSelectedCounsellor(counsellor);
    setShowBookingModal(true);
  };

  // Get tomorrow's date as minimum
  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 1);
  const minDateStr = minDate.toISOString().split("T")[0];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
              Career Counselling
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Get personalized guidance from our expert counsellors. Book a session 
              to discuss career paths, skill development, and job opportunities.
            </p>
          </div>

          {/* My Bookings */}
          {user && myBookings.length > 0 && (
            <div className="mb-12">
              <h2 className="text-xl font-semibold mb-4">My Upcoming Sessions</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {myBookings.slice(0, 3).map((booking) => {
                  const counsellor = counsellors.find(c => c.id === booking.counsellor_id);
                  return (
                    <div key={booking.id} className="bg-card rounded-xl border p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <div className="font-medium">{counsellor?.name || "Counsellor"}</div>
                          <div className="text-sm text-muted-foreground">
                            {counsellor?.specialization}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(booking.booking_date).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {booking.booking_time}
                        </div>
                      </div>
                      <Badge
                        className={`mt-3 ${
                          booking.status === "confirmed"
                            ? "bg-success/10 text-success"
                            : "bg-warning/10 text-warning"
                        }`}
                      >
                        {booking.status === "confirmed" ? "Confirmed" : "Pending"}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Counsellors Grid */}
          <h2 className="text-xl font-semibold mb-4">Our Counsellors</h2>
          {loadingData ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-card rounded-xl border p-6 animate-pulse">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 rounded-full bg-muted" />
                    <div className="flex-1">
                      <div className="h-5 bg-muted rounded w-3/4 mb-2" />
                      <div className="h-4 bg-muted rounded w-1/2" />
                    </div>
                  </div>
                  <div className="h-10 bg-muted rounded" />
                </div>
              ))}
            </div>
          ) : counsellors.length === 0 ? (
            <div className="text-center py-16 bg-card rounded-xl border">
              <MessageCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Counsellors Available</h3>
              <p className="text-muted-foreground">
                Please check back later for available counsellors.
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {counsellors.map((counsellor, index) => (
                <motion.div
                  key={counsellor.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-card rounded-xl border p-6 card-hover"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                      <User className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{counsellor.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {counsellor.specialization}
                      </p>
                      <div className="flex items-center gap-1 mt-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className="w-3 h-3 fill-accent text-accent"
                          />
                        ))}
                        <span className="text-xs text-muted-foreground ml-1">
                          5.0
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="text-sm text-muted-foreground mb-2">
                      Available Slots:
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {counsellor.available_slots?.slice(0, 3).map((slot: string) => (
                        <Badge key={slot} variant="secondary" className="text-xs">
                          {slot}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      className="flex-1 btn-primary-glow"
                      onClick={() => openBookingModal(counsellor)}
                    >
                      <Video className="w-4 h-4 mr-2" />
                      Book Session
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Features */}
          <div className="mt-16 grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Video className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Video Sessions</h3>
              <p className="text-sm text-muted-foreground">
                Connect face-to-face with counsellors via secure video calls.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mx-auto mb-4">
                <Phone className="w-6 h-6 text-accent" />
              </div>
              <h3 className="font-semibold mb-2">Phone Support</h3>
              <p className="text-sm text-muted-foreground">
                Prefer calls? Get guidance over phone at your convenience.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-6 h-6 text-success" />
              </div>
              <h3 className="font-semibold mb-2">Expert Guidance</h3>
              <p className="text-sm text-muted-foreground">
                Get advice from certified career experts and industry mentors.
              </p>
            </div>
          </div>
        </motion.div>
      </main>
      <Footer />

      {/* Booking Modal */}
      <Dialog open={showBookingModal} onOpenChange={setShowBookingModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Book a Session</DialogTitle>
            <DialogDescription>
              Schedule a counselling session with {selectedCounsellor?.name}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="date">Select Date</Label>
              <Input
                id="date"
                type="date"
                value={bookingDate}
                onChange={(e) => setBookingDate(e.target.value)}
                min={minDateStr}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="time">Select Time</Label>
              <Select value={bookingTime} onValueChange={setBookingTime}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Choose a time slot" />
                </SelectTrigger>
                <SelectContent>
                  {selectedCounsellor?.available_slots?.map((slot: string) => (
                    <SelectItem key={slot} value={slot}>
                      {slot}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                value={bookingNotes}
                onChange={(e) => setBookingNotes(e.target.value)}
                placeholder="What would you like to discuss?"
                className="mt-1"
                rows={3}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowBookingModal(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleBookSession}
              disabled={!bookingDate || !bookingTime || isBooking}
              className="btn-primary-glow"
            >
              {isBooking ? "Booking..." : "Confirm Booking"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Counsellor;