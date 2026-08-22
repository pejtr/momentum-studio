import { useParams, Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, Eye, ArrowLeft, User } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import { sanitizeBlogHtml } from "@/lib/sanitizeBlogHtml";
import { useState, useEffect } from "react";
import { Helmet } from "react-helmet";

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const { language, t } = useLanguage();
  const [comment, setComment] = useState("");
  const dateLocale = language === "cz" ? "cs-CZ" : "en-US";

  const { data: post, isLoading } = trpc.blog.getBySlug.useQuery({ slug: slug! });
  const { data: comments } = trpc.blog.comments.useQuery(
    { postId: post?.id! },
    { enabled: !!post?.id }
  );

  const addCommentMutation = trpc.blog.addComment.useMutation({
    onSuccess: () => {
      setComment("");
      window.location.reload();
    },
  });

  const handleSubmitComment = () => {
    if (!post || !comment.trim()) return;
    addCommentMutation.mutate({
      postId: post.id,
      content: comment,
    });
  };

  useEffect(() => {
    if (post) {
      document.title = `${post.title} | QA Automation Blog`;
    }
  }, [post]);

  if (isLoading) {
    return (
      <div className="container mx-auto py-12">
        <div className="max-w-4xl mx-auto animate-pulse">
          <div className="h-10 bg-muted rounded w-3/4 mb-4"></div>
          <div className="h-6 bg-muted rounded w-1/2 mb-8"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-4 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="container mx-auto py-12 text-center">
        <h1 className="text-2xl font-bold mb-4">{t("blog.postNotFound")}</h1>
        <Link href="/blog">
          <Button>{t("blog.backToBlog")}</Button>
        </Link>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{post.title} | QA Automation Blog</title>
        <meta name="description" content={post.metaDescription || post.excerpt || ""} />
        <meta name="keywords" content={post.keywords || ""} />
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={post.metaDescription || post.excerpt || ""} />
        {post.featuredImage && <meta property="og:image" content={post.featuredImage} />}
        <meta property="og:type" content="article" />
        {post.publishedAt && (
          <meta property="article:published_time" content={new Date(post.publishedAt).toISOString()} />
        )}
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950">
        <div className="container mx-auto py-12 px-4">
          <div className="max-w-4xl mx-auto">
            {/* Back Button */}
            <Link href="/blog">
              <Button variant="ghost" className="mb-6 text-slate-300 hover:text-white">
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t("blog.backToBlog")}
              </Button>
            </Link>

            {/* Article Header */}
            <article className="bg-slate-900/50 border border-slate-800 rounded-lg p-8 mb-8">
              <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
                {post.title}
              </h1>

              <div className="flex items-center gap-6 text-sm text-slate-400 mb-6">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>
                    {post.publishedAt
                      ? new Date(post.publishedAt).toLocaleDateString(dateLocale, {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })
                      : t("blog.draft")}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  <span>{post.viewCount} {t("blog.views")}</span>
                </div>
              </div>

              {post.featuredImage && (
                <div className="aspect-video w-full overflow-hidden rounded-lg mb-8">
                  <img
                    src={post.featuredImage}
                    alt={post.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Article Content */}
              <div
                className="prose prose-invert prose-indigo max-w-none"
                dangerouslySetInnerHTML={{ __html: sanitizeBlogHtml(post.content) }}
              />

              {/* Tags */}
              {post.keywords && (
                <div className="flex flex-wrap gap-2 mt-8 pt-8 border-t border-slate-800">
                  {post.keywords.split(",").map((keyword, i) => (
                    <Badge key={i} variant="secondary">
                      {keyword.trim()}
                    </Badge>
                  ))}
                </div>
              )}
            </article>

            {/* Comments Section */}
            <Card className="bg-slate-900/50 border-slate-800">
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold mb-6 text-slate-100">
                  {t("blog.comments")} ({comments?.filter((c) => c.status === "approved").length || 0})
                </h2>

                {/* Add Comment Form */}
                {user ? (
                  <div className="mb-8">
                    <Textarea
                      placeholder={t("blog.shareThoughts")}
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      className="mb-3 bg-slate-800 border-slate-700 text-slate-100"
                      rows={4}
                    />
                    <Button
                      onClick={handleSubmitComment}
                      disabled={!comment.trim() || addCommentMutation.isPending}
                    >
                      {addCommentMutation.isPending ? t("blog.posting") : t("blog.postComment")}
                    </Button>
                  </div>
                ) : (
                  <div className="mb-8 p-4 bg-slate-800 rounded-lg text-slate-300">
                    {t("blog.loginToComment")}
                  </div>
                )}

                {/* Comments List */}
                <div className="space-y-4">
                  {comments
                    ?.filter((c) => c.status === "approved")
                    .map((c) => (
                      <div key={c.id} className="p-4 bg-slate-800 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <User className="w-4 h-4 text-slate-400" />
                          <span className="text-sm text-slate-400">
                            {new Date(c.createdAt).toLocaleDateString(dateLocale)}
                          </span>
                        </div>
                        <p className="text-slate-200">{c.content}</p>
                      </div>
                    ))}
                </div>

                {(!comments || comments.filter((c) => c.status === "approved").length === 0) && (
                  <p className="text-slate-400 text-center py-8">
                    {t("blog.noComments")}
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
