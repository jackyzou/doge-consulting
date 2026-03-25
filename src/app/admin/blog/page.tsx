"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Edit, Trash2, Eye, EyeOff, Loader2, FileText, ExternalLink } from "lucide-react";
import { toast } from "sonner";

interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  emoji: string;
  published: boolean;
  authorName: string;
  readTime: string;
  createdAt: string;
}

const EMPTY_POST = { title: "", slug: "", excerpt: "", content: "", category: "General", emoji: "📦", published: false, readTime: "5 min" };

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<BlogPost> | null>(null);
  const [saving, setSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  const fetchPosts = () => {
    fetch("/api/admin/blog").then(r => r.json()).then(data => { setPosts(Array.isArray(data) ? data : []); setLoading(false); }).catch(() => setLoading(false));
  };

  useEffect(fetchPosts, []);

  const handleSave = async () => {
    if (!editing?.title || !editing?.content) { toast.error("Title and content are required"); return; }
    setSaving(true);
    const slug = editing.slug || editing.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-+/g, "-");
    const payload = { ...editing, slug };

    try {
      const isNew = !editing.id;
      const res = await fetch(isNew ? "/api/admin/blog" : `/api/admin/blog/${editing.id}`, {
        method: isNew ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) { const err = await res.json(); toast.error(err.error || "Failed to save"); setSaving(false); return; }
      toast.success(isNew ? "Post created!" : "Post updated!");
      setDialogOpen(false);
      setEditing(null);
      fetchPosts();
    } catch { toast.error("Network error"); }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this post?")) return;
    await fetch(`/api/admin/blog/${id}`, { method: "DELETE" });
    toast.success("Post deleted");
    fetchPosts();
  };

  const togglePublish = async (post: BlogPost) => {
    await fetch(`/api/admin/blog/${post.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ published: !post.published }),
    });
    toast.success(post.published ? "Unpublished" : "Published!");
    fetchPosts();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Blog Posts</h1>
          <p className="text-muted-foreground">{posts.length} posts ({posts.filter(p => p.published).length} published)</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-teal hover:bg-teal/90" onClick={() => setEditing({ ...EMPTY_POST })}>
              <Plus className="h-4 w-4 mr-2" /> New Post
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>{editing?.id ? "Edit Post" : "New Post"}</DialogTitle></DialogHeader>
            {editing && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Title *</Label><Input value={editing.title || ""} onChange={e => setEditing({ ...editing, title: e.target.value })} className="mt-1" /></div>
                  <div><Label>Slug</Label><Input value={editing.slug || ""} onChange={e => setEditing({ ...editing, slug: e.target.value })} placeholder="auto-generated" className="mt-1" /></div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div><Label>Category</Label><Input value={editing.category || ""} onChange={e => setEditing({ ...editing, category: e.target.value })} className="mt-1" /></div>
                  <div><Label>Emoji</Label><Input value={editing.emoji || ""} onChange={e => setEditing({ ...editing, emoji: e.target.value })} className="mt-1" /></div>
                  <div><Label>Read Time</Label><Input value={editing.readTime || ""} onChange={e => setEditing({ ...editing, readTime: e.target.value })} className="mt-1" /></div>
                </div>
                <div><Label>Excerpt</Label><Input value={editing.excerpt || ""} onChange={e => setEditing({ ...editing, excerpt: e.target.value })} className="mt-1" /></div>
                <div>
                  <Label>Content (Markdown) *</Label>
                  <textarea value={editing.content || ""} onChange={e => setEditing({ ...editing, content: e.target.value })}
                    className="mt-1 w-full min-h-[300px] rounded-md border bg-background px-3 py-2 text-sm font-mono" placeholder="## Your Article&#10;&#10;Write in markdown..." />
                </div>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={editing.published || false} onChange={e => setEditing({ ...editing, published: e.target.checked })} className="rounded" />
                    <span className="text-sm font-medium">Published</span>
                  </label>
                  <div className="flex-1" />
                  <Button variant="outline" onClick={() => { setDialogOpen(false); setEditing(null); }}>Cancel</Button>
                  <Button className="bg-teal hover:bg-teal/90" onClick={handleSave} disabled={saving}>
                    {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />} Save
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-teal" /></div>
      ) : posts.length === 0 ? (
        <Card><CardContent className="py-12 text-center"><FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" /><p className="font-semibold">No blog posts yet</p><p className="text-sm text-muted-foreground">Create your first post to get started.</p></CardContent></Card>
      ) : (
        <div className="space-y-3">
          {posts.map(post => (
            <Card key={post.id}>
              <CardContent className="p-4 flex items-center gap-4">
                <span className="text-2xl">{post.emoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold truncate">{post.title}</h3>
                    <Badge variant={post.published ? "default" : "secondary"} className={post.published ? "bg-green-600" : ""}>
                      {post.published ? "Published" : "Draft"}
                    </Badge>
                    <Badge variant="outline">{post.category}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground truncate">{post.excerpt}</p>
                  <p className="text-xs text-muted-foreground mt-1">/{post.slug} · {post.readTime} · {new Date(post.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="flex gap-1 shrink-0">
                  <Button size="icon" variant="ghost" onClick={() => window.open(`/blog/${post.slug}?preview=1`, "_blank")} title="Preview">
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="ghost" onClick={() => togglePublish(post)} title={post.published ? "Unpublish" : "Publish"}>
                    {post.published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                  <Button size="icon" variant="ghost" onClick={() => { setEditing(post); setDialogOpen(true); }}><Edit className="h-4 w-4" /></Button>
                  <Button size="icon" variant="ghost" className="text-red-500 hover:text-red-600" onClick={() => handleDelete(post.id)}><Trash2 className="h-4 w-4" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
