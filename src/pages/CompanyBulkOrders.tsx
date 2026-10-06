import { useState } from "react";
import { motion } from "framer-motion";
import {
  Building2,
  Package,
  IndianRupee,
  CheckCircle,
  Clock,
  Plus,
  Upload,
  ChevronRight,
  Star,
  Shield,
  Users,
  Briefcase,
  FileText,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

interface BulkOrder {
  id: string;
  company_name: string;
  company_type: string;
  product_category: string;
  description: string;
  total_quantity: number;
  price_per_unit: number;
  total_value: number;
  deadline: string;
  quality_requirements: string;
  shg_assigned: string | null;
  status: "pending" | "matched" | "in_production" | "completed";
  created_at: string;
}

const DEMO_ORDERS: BulkOrder[] = [
  {
    id: "bo-1",
    company_name: "Kalki Fashion Pvt Ltd",
    company_type: "Fashion Brand",
    product_category: "Stitching & Tailoring",
    description: "500 cotton kurtas with simple embroidery. Fabric provided. Pattern sheets will be shared.",
    total_quantity: 500,
    price_per_unit: 120,
    total_value: 60000,
    deadline: "2026-04-15",
    quality_requirements: "Standard stitching, no loose threads, even seams",
    shg_assigned: "Mahila Shakti SHG",
    status: "in_production",
    created_at: new Date().toISOString(),
  },
  {
    id: "bo-2",
    company_name: "Prakriti Foods",
    company_type: "Food Company",
    product_category: "Food Processing",
    description: "2000 units of hand-rolled papad and 500kg of homemade pickle. FSSAI certification required.",
    total_quantity: 2500,
    price_per_unit: 45,
    total_value: 112500,
    deadline: "2026-03-30",
    quality_requirements: "FSSAI hygiene standards, uniform size and weight",
    shg_assigned: "Pragati Mahila Mandal",
    status: "matched",
    created_at: new Date().toISOString(),
  },
  {
    id: "bo-3",
    company_name: "ArtCraft Exports",
    company_type: "Export House",
    product_category: "Craftwork & Handicrafts",
    description: "200 sets of handmade terracotta diyas and decorative items for export. Must meet international quality.",
    total_quantity: 2000,
    price_per_unit: 35,
    total_value: 70000,
    deadline: "2026-05-01",
    quality_requirements: "No cracks, uniform glaze, export-quality packaging",
    shg_assigned: null,
    status: "pending",
    created_at: new Date().toISOString(),
  },
];

const PRODUCT_CATEGORIES = [
  "Stitching & Tailoring",
  "Embroidery & Needlework",
  "Food Processing",
  "Craftwork & Handicrafts",
  "Packaging & Assembly",
  "Candle & Soap Making",
  "Jute Products",
  "Paper Products",
  "Pottery & Terracotta",
  "Incense Making",
];

const CompanyBulkOrders = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();

  const [orders, setOrders] = useState<BulkOrder[]>(DEMO_ORDERS);
  const [showPlaceOrder, setShowPlaceOrder] = useState(false);
  const [loading, setLoading] = useState(false);

  const [orderForm, setOrderForm] = useState({
    company_name: "",
    company_type: "",
    product_category: "",
    description: "",
    total_quantity: "",
    price_per_unit: "",
    deadline: "",
    quality_requirements: "",
  });

  const handlePlaceOrder = async () => {
    setLoading(true);
    try {
      const qty = parseInt(orderForm.total_quantity);
      const price = parseFloat(orderForm.price_per_unit);
      const newOrder: BulkOrder = {
        id: `bo-${Date.now()}`,
        company_name: orderForm.company_name,
        company_type: orderForm.company_type,
        product_category: orderForm.product_category,
        description: orderForm.description,
        total_quantity: qty,
        price_per_unit: price,
        total_value: qty * price,
        deadline: orderForm.deadline,
        quality_requirements: orderForm.quality_requirements,
        shg_assigned: null,
        status: "pending",
        created_at: new Date().toISOString(),
      };
      setOrders(prev => [newOrder, ...prev]);
      setShowPlaceOrder(false);
      setOrderForm({ company_name: "", company_type: "", product_category: "", description: "", total_quantity: "", price_per_unit: "", deadline: "", quality_requirements: "" });
      toast({
        title: "Order Submitted!",
        description: "BloomPath will match your order with the best-fit verified SHG within 48 hours.",
      });
    } catch {
      toast({ title: "Error", description: "Failed to place order.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const statusColors = {
    pending: "bg-warning/10 text-warning border-warning/30",
    matched: "bg-primary/10 text-primary border-primary/30",
    in_production: "bg-accent/10 text-accent border-accent/30",
    completed: "bg-success/10 text-success border-success/30",
  };

  const statusLabels = {
    pending: "Seeking SHG",
    matched: "SHG Matched",
    in_production: "In Production",
    completed: "Completed",
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
            <div>
              <h1 className="text-3xl font-display font-bold text-foreground mb-2 flex items-center gap-2">
                <Building2 className="w-8 h-8 text-primary" />
                Bulk Orders for SHGs
              </h1>
              <p className="text-muted-foreground">
                Companies can place bulk orders · BloomPath matches with verified SHGs · Ethical sourcing
              </p>
            </div>
            <Button onClick={() => setShowPlaceOrder(true)} className="btn-primary-glow mt-4 md:mt-0">
              <Plus className="w-4 h-4 mr-2" />
              Place Bulk Order
            </Button>
          </div>

          {/* How it works */}
          <div className="grid md:grid-cols-4 gap-4 mb-8">
            {[
              { icon: FileText, step: "1", title: "Submit Order", desc: "Companies describe their product needs and quantity" },
              { icon: Users, step: "2", title: "SHG Matching", desc: "BloomPath AI matches order with verified, suitable SHGs" },
              { icon: Package, step: "3", title: "Production", desc: "SHGs distribute work to skilled women, track progress" },
              { icon: CheckCircle, step: "4", title: "Delivery & Payment", desc: "Quality checked, delivered, SHG & women get paid" },
            ].map((item) => (
              <div key={item.step} className="bg-card rounded-xl border p-4 text-center relative">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
                  {item.step}
                </div>
                <item.icon className="w-6 h-6 text-primary mx-auto mt-2 mb-2" />
                <div className="font-semibold text-sm">{item.title}</div>
                <div className="text-xs text-muted-foreground mt-1">{item.desc}</div>
              </div>
            ))}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: "Active Orders", value: orders.filter(o => o.status !== "completed").length.toString(), icon: Briefcase, color: "text-primary" },
              { label: "Total Value", value: `₹${orders.reduce((a, o) => a + o.total_value, 0).toLocaleString()}`, icon: IndianRupee, color: "text-success" },
              { label: "SHGs Engaged", value: "2", icon: Users, color: "text-accent" },
              { label: "Completed Orders", value: orders.filter(o => o.status === "completed").length.toString(), icon: CheckCircle, color: "text-warning" },
            ].map((s) => (
              <div key={s.label} className="bg-card rounded-xl border p-4">
                <s.icon className={`w-5 h-5 ${s.color} mb-2`} />
                <div className="text-2xl font-bold">{s.value}</div>
                <div className="text-xs text-muted-foreground">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Orders List */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Current Orders</h2>
            {orders.map((order, i) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-card rounded-xl border p-6"
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-lg">{order.company_name}</h3>
                      <Badge variant="outline" className="text-xs">{order.company_type}</Badge>
                    </div>
                    <Badge variant="secondary" className="text-xs mb-3">{order.product_category}</Badge>
                    <p className="text-sm text-muted-foreground mb-3">{order.description}</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                      <div>
                        <div className="text-muted-foreground text-xs">Quantity</div>
                        <div className="font-medium">{order.total_quantity.toLocaleString()} units</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground text-xs">Price/Unit</div>
                        <div className="font-medium">₹{order.price_per_unit}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground text-xs">Total Value</div>
                        <div className="font-semibold text-success">₹{order.total_value.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground text-xs">Deadline</div>
                        <div className="font-medium flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(order.deadline).toLocaleDateString("en-IN")}
                        </div>
                      </div>
                    </div>
                    {order.shg_assigned && (
                      <div className="mt-3 flex items-center gap-2 text-sm">
                        <Shield className="w-4 h-4 text-success" />
                        <span className="text-muted-foreground">Assigned to:</span>
                        <span className="font-medium text-success">{order.shg_assigned}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-3">
                    <Badge className={`${statusColors[order.status]} border text-xs`}>
                      {statusLabels[order.status]}
                    </Badge>
                    {order.status === "pending" && (
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Matching in progress...
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </main>
      <Footer />

      {/* Place Bulk Order Modal */}
      <Dialog open={showPlaceOrder} onOpenChange={setShowPlaceOrder}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Place Bulk Order</DialogTitle>
            <DialogDescription>
              Connect with verified SHGs for ethical, high-quality home-based production.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Company Name *</Label>
                <Input value={orderForm.company_name} onChange={e => setOrderForm(p => ({...p, company_name: e.target.value}))} placeholder="Your company name" />
              </div>
              <div>
                <Label>Company Type *</Label>
                <Input value={orderForm.company_type} onChange={e => setOrderForm(p => ({...p, company_type: e.target.value}))} placeholder="e.g., Fashion Brand" />
              </div>
            </div>
            <div>
              <Label>Product Category *</Label>
              <Select onValueChange={v => setOrderForm(p => ({...p, product_category: v}))}>
                <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>{PRODUCT_CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Order Description *</Label>
              <Textarea value={orderForm.description} onChange={e => setOrderForm(p => ({...p, description: e.target.value}))} placeholder="Describe exactly what you need — product type, specifications, materials..." rows={3} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Total Quantity *</Label>
                <Input type="number" value={orderForm.total_quantity} onChange={e => setOrderForm(p => ({...p, total_quantity: e.target.value}))} placeholder="e.g., 1000" />
              </div>
              <div>
                <Label>Price Per Unit (₹) *</Label>
                <Input type="number" value={orderForm.price_per_unit} onChange={e => setOrderForm(p => ({...p, price_per_unit: e.target.value}))} placeholder="e.g., 80" />
              </div>
            </div>
            {orderForm.total_quantity && orderForm.price_per_unit && (
              <div className="bg-success/10 border border-success/30 rounded-lg p-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Estimated Total Order Value</span>
                  <span className="font-bold text-success text-lg">
                    ₹{(parseInt(orderForm.total_quantity) * parseFloat(orderForm.price_per_unit)).toLocaleString()}
                  </span>
                </div>
              </div>
            )}
            <div>
              <Label>Deadline *</Label>
              <Input type="date" value={orderForm.deadline} onChange={e => setOrderForm(p => ({...p, deadline: e.target.value}))} />
            </div>
            <div>
              <Label>Quality Requirements</Label>
              <Textarea value={orderForm.quality_requirements} onChange={e => setOrderForm(p => ({...p, quality_requirements: e.target.value}))} placeholder="Specify quality standards, certifications needed, packaging requirements..." rows={2} />
            </div>
            <div className="flex items-start gap-2 text-xs text-muted-foreground bg-accent/10 p-3 rounded-lg">
              <TrendingUp className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
              <span>BloomPath will match your order with 1-3 suitable verified SHGs within 48 hours. You'll receive proposals before final assignment.</span>
            </div>
            <Button
              onClick={handlePlaceOrder}
              disabled={loading || !orderForm.company_name || !orderForm.product_category || !orderForm.total_quantity}
              className="w-full btn-primary-glow"
            >
              {loading ? "Submitting..." : "Submit Order"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CompanyBulkOrders;
