import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  Store,
  Search,
  Star,
  Download,
  DollarSign,
  TrendingUp,
  Filter,
  Twitter,
  Instagram,
  Facebook,
} from "lucide-react";
import { toast } from "sonner";

const PLATFORM_ICONS: Record<string, React.ElementType> = {
  twitter: Twitter,
  instagram: Instagram,
  facebook: Facebook,
};

export default function Marketplace() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedPlatform, setSelectedPlatform] = useState<string>("all");
  const [selectedTemplate, setSelectedTemplate] = useState<number | null>(null);
  const [newRating, setNewRating] = useState(0);
  const [newComment, setNewComment] = useState("");

  const { data: templates } = trpc.marketplace.list.useQuery({
    category: selectedCategory === "all" ? undefined : selectedCategory,
    platform: selectedPlatform === "all"
      ? undefined
      : selectedPlatform as "twitter" | "instagram" | "facebook" | "tiktok" | "youtube" | "multi",
    limit: 50,
  });

  const { data: templateDetail } = trpc.marketplace.get.useQuery(
    { id: selectedTemplate! },
    { enabled: selectedTemplate !== null }
  );

  const { data: reviews } = trpc.marketplace.getReviews.useQuery(
    { templateId: selectedTemplate! },
    { enabled: selectedTemplate !== null }
  );

  const submitReview = trpc.marketplace.addReview.useMutation({
    onSuccess: () => {
      toast.success("Review submitted successfully!");
      setNewRating(0);
      setNewComment("");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to submit review");
    },
  });

  const purchase = trpc.marketplace.purchase.useMutation({
    onSuccess: () => {
      toast.success("Template purchased successfully!");
      setSelectedTemplate(null);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to purchase template");
    },
  });

  const handleSubmitReview = () => {
    if (!selectedTemplate || newRating === 0) return;
    submitReview.mutate({
      templateId: selectedTemplate,
      rating: newRating,
      comment: newComment || undefined,
    });
  };

  const filteredTemplates = templates?.filter((t) =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Store className="h-6 w-6 text-primary" />
          Template Marketplace
        </h1>
        <p className="text-muted-foreground mt-1">
          Discover and purchase automation workflow templates from the community
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Total Templates</p>
                <p className="text-xl font-bold text-foreground">{templates?.length || 0}</p>
              </div>
              <Store className="h-5 w-5 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Trending</p>
                <p className="text-xl font-bold text-foreground">12</p>
              </div>
              <TrendingUp className="h-5 w-5 text-chart-2" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Free Templates</p>
                <p className="text-xl font-bold text-foreground">{templates?.filter(t => t.price === 0).length || 0}</p>
              </div>
              <Download className="h-5 w-5 text-chart-3" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-card border-border">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="engagement">Engagement</SelectItem>
                <SelectItem value="posting">Posting</SelectItem>
                <SelectItem value="analytics">Analytics</SelectItem>
                <SelectItem value="growth">Growth</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
              <SelectTrigger>
                <SelectValue placeholder="Platform" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Platforms</SelectItem>
                <SelectItem value="twitter">Twitter/X</SelectItem>
                <SelectItem value="instagram">Instagram</SelectItem>
                <SelectItem value="facebook">Facebook</SelectItem>
                <SelectItem value="tiktok">TikTok</SelectItem>
                <SelectItem value="youtube">YouTube</SelectItem>
                <SelectItem value="multi">Multi-Platform</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              More Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Templates Grid */}
      {filteredTemplates && filteredTemplates.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTemplates.map((template) => {
            const PlatformIcon = PLATFORM_ICONS[template.platform] || Store;
            return (
              <Card
                key={template.id}
                className="bg-card border-border hover:border-primary/30 transition-colors cursor-pointer"
                onClick={() => setSelectedTemplate(template.id)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-base font-semibold line-clamp-1">
                      {template.name}
                    </CardTitle>
                    <PlatformIcon className="h-4 w-4 text-primary shrink-0" />
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                    {template.description || "No description available"}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Star className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500" />
                      <span className="text-sm font-medium text-foreground">
                        {template.rating ? (template.rating / 20).toFixed(1) : "0.0"}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        ({template.reviewCount})
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        <Download className="h-3 w-3 mr-1" />
                        {template.downloads}
                      </Badge>
                      {template.price > 0 ? (
                        <Badge className="text-xs bg-primary/20 text-primary border-primary/20">
                          <DollarSign className="h-3 w-3" />
                          {(template.price / 100).toFixed(2)}
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs text-green-500 border-green-500/20 bg-green-500/10">
                          Free
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="bg-card border-border">
          <CardContent className="py-12 text-center">
            <Store className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
            <h3 className="font-semibold text-foreground mb-1">No Templates Found</h3>
            <p className="text-sm text-muted-foreground">
              Try adjusting your search or filters
            </p>
          </CardContent>
        </Card>
      )}

      {/* Template Detail Dialog */}
      <Dialog open={selectedTemplate !== null} onOpenChange={() => setSelectedTemplate(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{templateDetail?.name}</DialogTitle>
          </DialogHeader>
          {templateDetail && (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">{templateDetail.description}</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                  <span className="text-sm font-medium">
                    {templateDetail.rating ? (templateDetail.rating / 20).toFixed(1) : "0.0"}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    ({templateDetail.reviewCount} reviews)
                  </span>
                </div>
                <Badge variant="outline">
                  <Download className="h-3 w-3 mr-1" />
                  {templateDetail.downloads} downloads
                </Badge>
                <Badge variant="outline">{templateDetail.platform}</Badge>
              </div>
              <div className="border-t pt-4">
                <h4 className="font-semibold mb-2">Recent Reviews</h4>
                {reviews && reviews.length > 0 ? (
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {reviews.slice(0, 5).map((review) => (
                      <div key={review.id} className="p-3 rounded-lg bg-accent/30">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-3 w-3 ${i < review.rating ? "text-yellow-500 fill-yellow-500" : "text-gray-300"}`}
                              />
                            ))}
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        {review.comment && (
                          <p className="text-sm text-foreground">{review.comment}</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No reviews yet</p>
                )}
              </div>
              {/* Review Submission Form */}
              <div className="border-t pt-4">
                <h4 className="font-semibold mb-3">Write a Review</h4>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm text-muted-foreground mb-2 block">Rating</label>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setNewRating(star)}
                          className="transition-colors"
                        >
                          <Star
                            className={`h-6 w-6 ${star <= newRating ? "text-yellow-500 fill-yellow-500" : "text-gray-300"}`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground mb-2 block">Comment (optional)</label>
                    <Textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Share your experience with this template..."
                      rows={3}
                      className="resize-none"
                    />
                  </div>
                  <Button
                    onClick={handleSubmitReview}
                    disabled={newRating === 0 || submitReview.isPending}
                    size="sm"
                    variant="outline"
                  >
                    {submitReview.isPending ? "Submitting..." : "Submit Review"}
                  </Button>
                </div>
              </div>
              <div className="flex items-center justify-between pt-4 border-t">
                <div className="text-2xl font-bold text-foreground">
                  {templateDetail.price > 0 ? `$${(templateDetail.price / 100).toFixed(2)}` : "Free"}
                </div>
                <Button
                  onClick={() => purchase.mutate({ templateId: templateDetail.id })}
                  disabled={purchase.isPending}
                >
                  {purchase.isPending ? "Processing..." : templateDetail.price > 0 ? "Purchase" : "Download"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
