import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "../../../ui/card";
import { Button } from "../../../ui/button";
import { Input } from "../../../ui/input";
import { Label } from "../../../ui/label";
import { Badge } from "../../../ui/badge";
import { Switch } from "../../../ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../../ui/dialog";
import {
  ArrowDown,
  ArrowUp,
  GripVertical,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

type ServiceCategory = {
  id: string;
  name: string;
  slug: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
};

function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function useAllServiceCategories() {
  return useQuery({
    queryKey: ["admin", "service_categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("service_categories")
        .select("*")
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return (data ?? []) as ServiceCategory[];
    },
  });
}

export function AdminServices() {
  const queryClient = useQueryClient();
  const { data: categories = [], isLoading } = useAllServiceCategories();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] =
    useState<ServiceCategory | null>(null);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [autoSlug, setAutoSlug] = useState(true);

  const invalidate = () =>
    queryClient.invalidateQueries({
      queryKey: ["admin", "service_categories"],
    });

  const createMutation = useMutation({
    mutationFn: async () => {
      const maxSort = categories.reduce(
        (max, c) => Math.max(max, c.sort_order),
        0,
      );
      const { error } = await supabase.from("service_categories").insert({
        name: name.trim(),
        slug: slug.trim(),
        sort_order: maxSort + 1,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      invalidate();
      queryClient.invalidateQueries({ queryKey: ["service_categories"] });
      toast.success("Service category created.");
      closeDialog();
    },
    onError: (err) =>
      toast.error(err instanceof Error ? err.message : "Failed to create."),
  });

  const updateMutation = useMutation({
    mutationFn: async () => {
      if (!editingCategory) return;
      const { error } = await supabase
        .from("service_categories")
        .update({ name: name.trim(), slug: slug.trim() })
        .eq("id", editingCategory.id);
      if (error) throw error;
    },
    onSuccess: () => {
      invalidate();
      queryClient.invalidateQueries({ queryKey: ["service_categories"] });
      toast.success("Category updated.");
      closeDialog();
    },
    onError: (err) =>
      toast.error(err instanceof Error ? err.message : "Failed to update."),
  });

  const toggleActiveMutation = useMutation({
    mutationFn: async ({
      id,
      is_active,
    }: {
      id: string;
      is_active: boolean;
    }) => {
      const { error } = await supabase
        .from("service_categories")
        .update({ is_active })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      invalidate();
      queryClient.invalidateQueries({ queryKey: ["service_categories"] });
    },
    onError: (err) =>
      toast.error(err instanceof Error ? err.message : "Failed to toggle."),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("service_categories")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      invalidate();
      queryClient.invalidateQueries({ queryKey: ["service_categories"] });
      toast.success("Category deleted.");
    },
    onError: (err) =>
      toast.error(err instanceof Error ? err.message : "Failed to delete."),
  });

  const reorderMutation = useMutation({
    mutationFn: async ({
      id,
      direction,
    }: {
      id: string;
      direction: "up" | "down";
    }) => {
      const idx = categories.findIndex((c) => c.id === id);
      if (idx < 0) return;
      const swapIdx = direction === "up" ? idx - 1 : idx + 1;
      if (swapIdx < 0 || swapIdx >= categories.length) return;

      const current = categories[idx];
      const swap = categories[swapIdx];

      const { error: e1 } = await supabase
        .from("service_categories")
        .update({ sort_order: swap.sort_order })
        .eq("id", current.id);
      if (e1) throw e1;

      const { error: e2 } = await supabase
        .from("service_categories")
        .update({ sort_order: current.sort_order })
        .eq("id", swap.id);
      if (e2) throw e2;
    },
    onSuccess: () => {
      invalidate();
      queryClient.invalidateQueries({ queryKey: ["service_categories"] });
    },
    onError: (err) =>
      toast.error(err instanceof Error ? err.message : "Failed to reorder."),
  });

  const openCreate = () => {
    setEditingCategory(null);
    setName("");
    setSlug("");
    setAutoSlug(true);
    setDialogOpen(true);
  };

  const openEdit = (category: ServiceCategory) => {
    setEditingCategory(category);
    setName(category.name);
    setSlug(category.slug);
    setAutoSlug(false);
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingCategory(null);
    setName("");
    setSlug("");
    setAutoSlug(true);
  };

  const handleNameChange = (value: string) => {
    setName(value);
    if (autoSlug) setSlug(slugify(value));
  };

  const handleSubmit = () => {
    if (!name.trim() || !slug.trim()) {
      toast.error("Name and slug are required.");
      return;
    }
    if (editingCategory) {
      updateMutation.mutate();
    } else {
      createMutation.mutate();
    }
  };

  if (isLoading) {
    return <div className="text-gray-500">Loading categories...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Service Categories</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage the list of service categories available across the platform.
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Add Category
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {categories.length} Categories
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y">
            {categories.map((category, idx) => (
              <div
                key={category.id}
                className="flex items-center gap-4 px-6 py-3"
              >
                <GripVertical className="h-4 w-4 shrink-0 text-gray-300" />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900">
                      {category.name}
                    </span>
                    <Badge variant="secondary" className="text-xs font-mono">
                      {category.slug}
                    </Badge>
                    {!category.is_active && (
                      <Badge
                        variant="outline"
                        className="text-xs text-gray-400"
                      >
                        Disabled
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <div className="flex flex-col">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() =>
                        reorderMutation.mutate({
                          id: category.id,
                          direction: "up",
                        })
                      }
                      className="p-0.5 text-gray-400 hover:text-gray-700 disabled:opacity-30"
                    >
                      <ArrowUp className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={idx === categories.length - 1}
                      onClick={() =>
                        reorderMutation.mutate({
                          id: category.id,
                          direction: "down",
                        })
                      }
                      className="p-0.5 text-gray-400 hover:text-gray-700 disabled:opacity-30"
                    >
                      <ArrowDown className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <Switch
                    checked={category.is_active}
                    onCheckedChange={(checked) =>
                      toggleActiveMutation.mutate({
                        id: category.id,
                        is_active: checked,
                      })
                    }
                  />

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => openEdit(category)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-red-500 hover:text-red-700"
                    onClick={() => {
                      if (
                        window.confirm(
                          `Delete "${category.name}"? This cannot be undone.`,
                        )
                      ) {
                        deleteMutation.mutate(category.id);
                      }
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}

            {categories.length === 0 && (
              <div className="px-6 py-8 text-center text-gray-500">
                No service categories. Click "Add Category" to create one.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? "Edit Category" : "Add Category"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label htmlFor="cat-name">Name</Label>
              <Input
                id="cat-name"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="e.g. Snow Clearing"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cat-slug">Slug</Label>
              <Input
                id="cat-slug"
                value={slug}
                onChange={(e) => {
                  setAutoSlug(false);
                  setSlug(e.target.value);
                }}
                placeholder="e.g. snow-clearing"
                className="font-mono text-sm"
              />
              <p className="text-xs text-gray-500">
                Used in filters and URLs. Auto-generated from name if left
                alone.
              </p>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={closeDialog}>
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {editingCategory ? "Save Changes" : "Create"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
