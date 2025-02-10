"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit2, Trash2 } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import ResourceHubForm from "./resource-hub-form";
import { useResourceHubs } from "../../context/ResourceHubContext";
import { deleteImage } from "../../firebase/storage";
import { useProvisions } from "../../context/ProvisionContext";
import { SearchInput } from "@/components/ui/search-input";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { useSettings } from "../../context/SettingsContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { capitalizeWords } from "../../utils/text";

export default function ResourceHubs({ isFormOpen, setIsFormOpen }) {
  const { resourceHubs, deleteResourceHub, loading, error } = useResourceHubs();
  const { provisions, updateProvision } = useProvisions();
  const [editingHub, setEditingHub] = useState(null);
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteConfirmation, setDeleteConfirmation] = useState({
    isOpen: false,
    hub: null
  });
  const { settings } = useSettings();
  const [sortOrder, setSortOrder] = useState("alphabetical");

  // Updated filter and sort logic
  const filteredHubs = resourceHubs
    .filter((hub) => hub.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      if (sortOrder === "alphabetical") {
        return a.name.localeCompare(b.name);
      } else if (sortOrder === "newest") {
        return (b.createdAt || 0) - (a.createdAt || 0);
      } else {
        return (a.createdAt || 0) - (b.createdAt || 0);
      }
    });

  const handleEdit = (hub) => {
    setEditingHub(hub);
    setIsFormOpen(true);
  };

  const handleDelete = async (hub) => {
    if (settings.showDeletionConfirmation) {
      setDeleteConfirmation({
        isOpen: true,
        hub
      });
    } else {
      // Direct deletion without confirmation
      try {
        await deleteResourceHub(hub.id);
        toast({
          title: "Success",
          description: "Resource hub deleted successfully"
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete resource hub",
          variant: "destructive"
        });
      }
    }
  };

  const confirmDelete = async () => {
    const hub = deleteConfirmation.hub;
    try {
      await deleteResourceHub(hub.id);
      toast({
        title: "Success",
        description: "Resource hub deleted successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete resource hub",
        variant: "destructive"
      });
    } finally {
      setDeleteConfirmation({ isOpen: false, hub: null });
    }
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingHub(null);
  };

  if (loading) {
    return (
      <div className="text-muted-foreground">Loading resource hubs...</div>
    );
  }

  if (error) {
    return <div className="text-destructive">Error loading resource hubs</div>;
  }

  return (
    <>
      <div className="flex flex-col lg:flex-row gap-4 mb-6">
        <div className="w-full lg:w-[calc((100%-2rem)/3)] lg:max-w-[calc((1280px-4rem-2rem)/3)]">
          <SearchInput
            placeholder="Search resource hubs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
        </div>
        <div className="flex gap-4 w-full lg:w-auto">
          <Select
            value={sortOrder}
            onValueChange={setSortOrder}
            className="flex-1 lg:flex-none"
          >
            <SelectTrigger className="w-full lg:w-[180px]">
              <SelectValue placeholder="Sort by..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="alphabetical">Alphabetical</SelectItem>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredHubs.map((hub) => (
          <Card key={hub.id} className="overflow-hidden">
            <CardContent className="p-0">
              <div className="flex items-center gap-4 p-4">
                <div className="h-16 w-16 rounded-md bg-muted flex-shrink-0 overflow-hidden">
                  {hub.imageUrl ? (
                    <img
                      src={hub.imageUrl}
                      alt={hub.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-muted" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold">
                    {capitalizeWords(hub.name)}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>
                      {hub.minProvisions}-{hub.maxProvisions} Resources Per List
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleEdit(hub)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleDelete(hub)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <ResourceHubForm
        open={isFormOpen}
        onOpenChange={handleCloseForm}
        initialData={editingHub}
      />

      <ConfirmationDialog
        open={deleteConfirmation.isOpen}
        onOpenChange={(open) =>
          setDeleteConfirmation((prev) => ({ ...prev, isOpen: open }))
        }
        title="Delete Resource Hub"
        description={`Are you sure you want to delete "${deleteConfirmation.hub?.name}"? This action cannot be undone.`}
        onConfirm={confirmDelete}
      />
    </>
  );
}
