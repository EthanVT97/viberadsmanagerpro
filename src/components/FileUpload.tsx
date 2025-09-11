import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Upload, X, Image, Video } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface FileUploadProps {
  onUpload: (url: string) => void;
  acceptedTypes: string;
  maxSize?: number;
  bucket: 'campaign-images' | 'campaign-videos';
  label: string;
  currentFile?: string;
}

export default function FileUpload({ 
  onUpload, 
  acceptedTypes, 
  maxSize = 50 * 1024 * 1024, // 50MB default
  bucket,
  label,
  currentFile 
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentFile || null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file size
    if (file.size > maxSize) {
      toast({
        title: "File too large",
        description: `File size must be less than ${Math.round(maxSize / (1024 * 1024))}MB`,
        variant: "destructive",
      });
      return;
    }

    setUploading(true);

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      // Create file path with user ID folder
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      // Upload file
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(fileName, file);

      if (error) throw error;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(data.path);

      setPreview(publicUrl);
      onUpload(publicUrl);

      toast({
        title: "Upload successful",
        description: "File uploaded successfully",
      });
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload file",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = async () => {
    if (!preview) return;

    try {
      // Extract file path from URL
      const url = new URL(preview);
      const pathParts = url.pathname.split('/');
      const path = pathParts.slice(-2).join('/'); // Get user_id/filename

      const { error } = await supabase.storage
        .from(bucket)
        .remove([path]);

      if (error) {
        console.error('Error removing file:', error);
      }

      setPreview(null);
      onUpload('');
      
      toast({
        title: "File removed",
        description: "File removed successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to remove file",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      
      {preview ? (
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {bucket === 'campaign-images' ? (
                <>
                  <Image className="h-8 w-8 text-muted-foreground" />
                  <img 
                    src={preview} 
                    alt="Preview" 
                    className="h-16 w-16 object-cover rounded"
                  />
                </>
              ) : (
                <>
                  <Video className="h-8 w-8 text-muted-foreground" />
                  <video 
                    src={preview} 
                    className="h-16 w-24 object-cover rounded"
                    controls={false}
                  />
                </>
              )}
              <span className="text-sm text-muted-foreground">Uploaded successfully</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRemove}
              disabled={uploading}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </Card>
      ) : (
        <Card 
          className="p-8 border-dashed border-2 hover:border-primary/50 transition-colors cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="text-center">
            <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-2">
              Click to upload {label?.toLowerCase() || 'file'}
            </p>
            <p className="text-xs text-muted-foreground">
              Max size: {Math.round(maxSize / (1024 * 1024))}MB
            </p>
          </div>
        </Card>
      )}

      <Input
        ref={fileInputRef}
        type="file"
        accept={acceptedTypes}
        onChange={handleFileSelect}
        disabled={uploading}
        className="hidden"
      />
    </div>
  );
}