"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit2, Trash2 } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import ProvisionForm from "./provision-form";
import { useProvisions } from "../../context/ProvisionContext";
import { deleteImage } from "../../firebase/storage";
import { useResourceHubs } from "../../context/ResourceHubContext";
import { updateResourceHub } from "../../firebase/firestore";
import { SearchInput } from "@/components/ui/search-input";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { useSettings } from "../../context/SettingsContext";

export default function Provisions({ isFormOpen, setIsFormOpen }) {
  const { provisions, deleteProvision, loading, error } = useProvisions();
  const [editingProvision, setEditingProvision] = useState(null);
  const { toast } = useToast();
  const { resourceHubs } = useResourceHubs();
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteConfirmation, setDeleteConfirmation] = useState({
    isOpen: false,
    provision: null
  });
  const { settings } = useSettings();

  const rarityColors = {
    Junk: "text-gray-500",
    Common: "text-green-600",
    Uncommon: "text-cyan-600",
    Rare: "text-blue-600",
    "Very Rare": "text-purple-600",
    Legendary: "text-yellow-600",
    Artifact: "text-red-600",
    Wondrous: "text-fuchsia-600",
    Varies: "text-orange-600"
  };

  const handleEdit = (provision) => {
    setEditingProvision(provision);
    setIsFormOpen(true);
  };

  const handleDelete = async (provision) => {
    if (settings.showDeletionConfirmation) {
      setDeleteConfirmation({
        isOpen: true,
        provision
      });
    } else {
      // Direct deletion without confirmation
      try {
        await deleteProvision(provision.id);
        if (provision.imageUrl) {
          await deleteImage(provision.imageUrl);
        }
        toast({
          title: "Success",
          description: "Provision deleted successfully"
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete provision",
          variant: "destructive"
        });
      }
    }
  };

  const confirmDelete = async () => {
    const provision = deleteConfirmation.provision;
    try {
      await deleteProvision(provision.id);
      if (provision.imageUrl) {
        await deleteImage(provision.imageUrl);
      }
      toast({
        title: "Success",
        description: "Provision deleted successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete provision",
        variant: "destructive"
      });
    } finally {
      setDeleteConfirmation({ isOpen: false, provision: null });
    }
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingProvision(null);
  };

  // Filter provisions based on search query
  const filteredProvisions = provisions.filter(
    (provision) =>
      provision.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      provision.rarity.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return <div className="text-muted-foreground">Loading provisions...</div>;
  }

  if (error) {
    return <div className="text-destructive">Error loading provisions</div>;
  }

  return (
    <>
      <div className="mb-6 lg:w-[calc((100%-2rem)/3)] lg:max-w-[calc((1280px-4rem-2rem)/3)]">
        <SearchInput
          placeholder="Search resources..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProvisions.map((provision) => (
          <Card key={provision.id} className="overflow-hidden">
            <CardContent className="p-0">
              <div className="flex items-center gap-4 p-4">
                <div className="h-16 w-16 rounded-md bg-muted flex-shrink-0 overflow-hidden">
                  {provision.imageUrl ? (
                    <img
                      src={provision.imageUrl}
                      alt={provision.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-muted" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold truncate">{provision.name}</h3>
                  <div className="flex items-center gap-2 text-sm">
                    <span className={rarityColors[provision.rarity]}>
                      {provision.rarity}
                    </span>
                    <span className="text-muted-foreground">
                      {provision.basePrice.toFixed(2)} gold
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleEdit(provision)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleDelete(provision)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <ProvisionForm
        open={isFormOpen}
        onOpenChange={handleCloseForm}
        initialData={editingProvision}
      />

      <ConfirmationDialog
        open={deleteConfirmation.isOpen}
        onOpenChange={(open) =>
          setDeleteConfirmation((prev) => ({ ...prev, isOpen: open }))
        }
        title="Delete Provision"
        description={`Are you sure you want to delete "${deleteConfirmation.provision?.name}"? This action cannot be undone.`}
        onConfirm={confirmDelete}
      />
    </>
  );
}
