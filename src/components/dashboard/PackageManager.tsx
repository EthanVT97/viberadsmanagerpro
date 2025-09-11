import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  Plus,
  Package,
  Edit,
  Trash2,
  Check,
  X,
  Crown,
  Star
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface Package {
  id: string;
  name: string;
  description: string;
  price_euro: number;
  features: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface PackageManagerProps {
  packages: Package[];
  onPackagesChange: () => void;
}

export default function PackageManager({ packages, onPackagesChange }: PackageManagerProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingPackage, setEditingPackage] = useState<Package | null>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price_euro: '',
    features: [] as string[],
    is_active: true
  });
  const [newFeature, setNewFeature] = useState('');

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price_euro: '',
      features: [],
      is_active: true
    });
    setNewFeature('');
  };

  const handleCreatePackage = async () => {
    if (!formData.name || !formData.price_euro || !user) {
      toast({
        title: "Missing information",
        description: "Please fill in package name and price.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('packages')
        .insert({
          name: formData.name,
          description: formData.description,
          price_euro: parseInt(formData.price_euro) * 100, // Convert to cents
          features: formData.features,
          is_active: formData.is_active,
          campaign_limit: 999999, // Unlimited
          monthly_impressions_limit: 999999999, // Unlimited
          ads_per_campaign_limit: 999999 // Unlimited
        });

      if (error) throw error;

      resetForm();
      setShowCreateDialog(false);
      onPackagesChange();

      toast({
        title: "Package created!",
        description: "Your new package has been created successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error creating package",
        description: error.message || "Failed to create package",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditPackage = async () => {
    if (!editingPackage || !formData.name || !formData.price_euro || !user) {
      toast({
        title: "Missing information",
        description: "Please fill in package name and price.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('packages')
        .update({
          name: formData.name,
          description: formData.description,
          price_euro: parseInt(formData.price_euro) * 100, // Convert to cents
          features: formData.features,
          is_active: formData.is_active,
          updated_at: new Date().toISOString()
        })
        .eq('id', editingPackage.id);

      if (error) throw error;

      resetForm();
      setEditingPackage(null);
      onPackagesChange();

      toast({
        title: "Package updated!",
        description: "Your package has been updated successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error updating package",
        description: error.message || "Failed to update package",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const deletePackage = async (packageId: string) => {
    if (!user) return;
    
    const pkg = packages.find(p => p.id === packageId);
    if (!pkg) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('packages')
        .delete()
        .eq('id', packageId);

      if (error) throw error;

      onPackagesChange();

      toast({
        title: "Package deleted",
        description: `${pkg.name} has been deleted.`,
      });
    } catch (error: any) {
      toast({
        title: "Error deleting package",
        description: error.message || "Failed to delete package",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const togglePackageStatus = async (packageId: string) => {
    const pkg = packages.find(p => p.id === packageId);
    if (!pkg) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('packages')
        .update({ 
          is_active: !pkg.is_active,
          updated_at: new Date().toISOString()
        })
        .eq('id', packageId);

      if (error) throw error;

      onPackagesChange();

      toast({
        title: pkg.is_active ? "Package deactivated" : "Package activated",
        description: `${pkg.name} has been ${pkg.is_active ? 'deactivated' : 'activated'}.`,
      });
    } catch (error: any) {
      toast({
        title: "Error updating package",
        description: error.message || "Failed to update package status",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const openEditDialog = (pkg: Package) => {
    setEditingPackage(pkg);
    setFormData({
      name: pkg.name,
      description: pkg.description,
      price_euro: (pkg.price_euro / 100).toString(),
      features: [...pkg.features],
      is_active: pkg.is_active
    });
  };

  const closeEditDialog = () => {
    setEditingPackage(null);
    resetForm();
  };

  const addFeature = () => {
    if (newFeature.trim() && !formData.features.includes(newFeature.trim())) {
      setFormData(prev => ({
        ...prev,
        features: [...prev.features, newFeature.trim()]
      }));
      setNewFeature('');
    }
  };

  const removeFeature = (featureToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter(feature => feature !== featureToRemove)
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold">Package Management</h2>
          <p className="text-sm sm:text-base text-muted-foreground">
            Create and manage advertising packages for your platform
          </p>
        </div>
        <Button 
          className="bg-gradient-primary text-primary-foreground border-0 w-full sm:w-auto"
          onClick={() => setShowCreateDialog(true)}
        >
          <Plus className="mr-2 h-4 w-4" />
          Create Package
        </Button>
      </div>

      {packages.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {packages.map((pkg) => (
            <Card key={pkg.id} className={`hover:shadow-card transition-shadow ${pkg.name === 'Video Pulse' ? 'ring-2 ring-primary/20' : ''}`}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    {pkg.name === 'Video Pulse' ? (
                      <Crown className="h-5 w-5 text-primary" />
                    ) : (
                      <Package className="h-5 w-5" />
                    )}
                    {pkg.name}
                  </CardTitle>
                  <div className="flex gap-2">
                    <Badge variant={pkg.is_active ? 'default' : 'secondary'}>
                      {pkg.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                    {pkg.name === 'Video Pulse' && (
                      <Badge className="bg-gradient-primary text-primary-foreground border-0">
                        Premium
                      </Badge>
                    )}
                  </div>
                </div>
                <CardDescription>{pkg.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <span className="text-2xl font-bold text-primary">
                      €{pkg.price_euro / 100}
                    </span>
                    <span className="text-sm text-muted-foreground ml-1">/month</span>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Features:</h4>
                    <ul className="space-y-1">
                      {pkg.features.slice(0, 3).map((feature, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm">
                          <Check className="h-3 w-3 text-primary mt-1 shrink-0" />
                          <span className="text-muted-foreground">{feature}</span>
                        </li>
                      ))}
                      {pkg.features.length > 3 && (
                        <li className="text-xs text-muted-foreground">
                          +{pkg.features.length - 3} more features
                        </li>
                      )}
                    </ul>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => togglePackageStatus(pkg.id)}
                      className="flex-1"
                      disabled={loading}
                    >
                      {pkg.is_active ? 'Deactivate' : 'Activate'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditDialog(pkg)}
                      className="flex-1"
                      disabled={loading}
                    >
                      <Edit className="mr-1 h-3 w-3" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deletePackage(pkg.id)}
                      className="text-destructive hover:text-destructive"
                      disabled={loading}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-6">
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold mb-2">No packages yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first advertising package
              </p>
              <Button 
                className="bg-gradient-primary text-primary-foreground border-0"
                onClick={() => setShowCreateDialog(true)}
              >
                <Plus className="mr-2 h-4 w-4" />
                Create Package
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Create Package Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-[600px] mx-4 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Package</DialogTitle>
            <DialogDescription>
              Set up a new advertising package for users.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="package-name">Package Name</Label>
              <Input
                id="package-name"
                placeholder="Enter package name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="package-description">Description</Label>
              <Textarea
                id="package-description"
                placeholder="Describe the package"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="package-price">Price (EUR)</Label>
              <Input
                id="package-price"
                type="number"
                placeholder="Enter price amount"
                value={formData.price_euro}
                onChange={(e) => setFormData(prev => ({ ...prev, price_euro: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label>Features</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Add a feature"
                  value={newFeature}
                  onChange={(e) => setNewFeature(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addFeature()}
                />
                <Button type="button" onClick={addFeature} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              
              {formData.features.length > 0 && (
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {formData.features.map((feature, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                      <span className="text-sm">{feature}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFeature(feature)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setShowCreateDialog(false)} className="flex-1" disabled={loading}>
              Cancel
            </Button>
            <Button onClick={handleCreatePackage} className="bg-gradient-primary text-primary-foreground border-0 flex-1" disabled={loading}>
              {loading ? "Creating..." : "Create Package"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Package Dialog */}
      <Dialog open={!!editingPackage} onOpenChange={() => closeEditDialog()}>
        <DialogContent className="sm:max-w-[600px] mx-4 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Package</DialogTitle>
            <DialogDescription>
              Update package details and features.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-package-name">Package Name</Label>
              <Input
                id="edit-package-name"
                placeholder="Enter package name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-package-description">Description</Label>
              <Textarea
                id="edit-package-description"
                placeholder="Describe the package"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-package-price">Price (EUR)</Label>
              <Input
                id="edit-package-price"
                type="number"
                placeholder="Enter price amount"
                value={formData.price_euro}
                onChange={(e) => setFormData(prev => ({ ...prev, price_euro: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label>Features</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Add a feature"
                  value={newFeature}
                  onChange={(e) => setNewFeature(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addFeature()}
                />
                <Button type="button" onClick={addFeature} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              
              {formData.features.length > 0 && (
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {formData.features.map((feature, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                      <span className="text-sm">{feature}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFeature(feature)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={closeEditDialog} className="flex-1" disabled={loading}>
              Cancel
            </Button>
            <Button onClick={handleEditPackage} className="bg-gradient-primary text-primary-foreground border-0 flex-1" disabled={loading}>
              {loading ? "Updating..." : "Update Package"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}