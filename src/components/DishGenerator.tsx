import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Utensils, Sparkles, ImageIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const DishGenerator = () => {
  const [dishDescription, setDishDescription] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [translatedName, setTranslatedName] = useState<string | null>(null);

  const translateDishName = async (dishName: string): Promise<string> => {
    try {
      const { data, error } = await supabase.functions.invoke('translate-dish', {
        body: { dishName }
      });

      if (error) {
        console.error('Translation error:', error);
        return dishName; // Fallback to original
      }

      return data?.translatedDish || dishName;
    } catch (err) {
      console.error('Translation failed:', err);
      return dishName; // Fallback to original
    }
  };

  const generateImage = async () => {
    if (!dishDescription.trim()) return;

    setIsLoading(true);
    setError(null);
    setImageUrl(null);
    setTranslatedName(null);

    try {
      // 1. Translate the dish name for better prompt accuracy
      toast.info("Translating dish name...");
      const translated = await translateDishName(dishDescription.trim());
      setTranslatedName(translated);
      
      // 2. Create the visual prompt
      const enhancedPrompt = `Professional food photography of ${translated}, beautifully plated, authentic cultural presentation, restaurant quality, soft natural lighting, shallow depth of field, appetizing, delicious, high resolution`;

      // 3. Invoke your Supabase Edge Function (The one talking to Google Gemini)
      const { data, error: funcError } = await supabase.functions.invoke('generate-dish-image', {
        body: { prompt: enhancedPrompt }
      });

      if (funcError) throw new Error(funcError.message);

      // 4. Handle the returned Base64 image data
      if (data?.image) {
        setImageUrl(data.image);
        toast.success("Image generated successfully!");
      } else {
        throw new Error("Google AI did not return an image. Please try a different dish name.");
      }

    } catch (err: any) {
      console.error('Generation failed:', err);
      setError(err.message || "Failed to generate image. Please check your Google AI Studio quota.");
      toast.error("Generation failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !isLoading && dishDescription.trim()) {
      generateImage();
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="pt-8 pb-4 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/80 text-secondary-foreground text-sm mb-6">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="font-medium">Powered by Google Gemini AI</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-4 pb-12">
        <div className="max-w-3xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl gradient-hero shadow-glow mb-6">
              <Utensils className="w-8 h-8 text-primary-foreground" />
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-foreground mb-4 leading-tight">
              Dish Image
              <span className="block text-primary">Generator</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-lg mx-auto">
              Transform your culinary ideas into stunning visuals using Google's latest AI models.
            </p>
          </div>

          {/* Input Section */}
          <div className="bg-card rounded-2xl p-6 md:p-8 shadow-card border border-border/50 mb-8">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Input
                  type="text"
                  placeholder="Describe your dish... e.g., spicy chicken curry with potatoes"
                  value={dishDescription}
                  onChange={(e) => setDishDescription(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={isLoading}
                  className="h-14"
                />
              </div>
              <Button
                onClick={generateImage}
                disabled={isLoading || !dishDescription.trim()}
                variant="hero"
                size="xl"
                className="min-w-[160px]"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    <span>Generate</span>
                  </>
                )}
              </Button>
            </div>
            
            {/* Quick suggestions */}
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="text-sm text-muted-foreground">Try:</span>
              {["Spaghetti Carbonara", "Sushi Platter", "Chocolate Lava Cake", "Thai Green Curry"].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => setDishDescription(suggestion)}
                  className="text-sm px-3 py-1 rounded-full bg-secondary hover:bg-secondary/80 text-secondary-foreground transition-colors duration-200"
                  disabled={isLoading}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="text-center p-4 mb-8 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive animate-fade-in">
              {error}
            </div>
          )}

          {/* Image Display */}
          <div className="relative">
            {isLoading && (
              <div className="bg-card rounded-2xl shadow-card border border-border/50 overflow-hidden aspect-square flex items-center justify-center animate-fade-in">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 relative">
                    <div className="absolute inset-0 rounded-full border-4 border-muted" />
                    <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin" />
                  </div>
                  <p className="text-muted-foreground font-medium">Creating your masterpiece...</p>
                  <p className="text-sm text-muted-foreground/70 mt-1">This may take a few seconds</p>
                </div>
              </div>
            )}

            {imageUrl && !isLoading && (
              <div className="bg-card rounded-2xl shadow-card border border-border/50 overflow-hidden animate-scale-in">
                <img
                  src={imageUrl}
                  alt={dishDescription}
                  className="w-full aspect-square object-cover"
                />
                <div className="p-4 border-t border-border/50">
                  <p className="text-sm text-foreground text-center font-medium">
                    {dishDescription}
                  </p>
                  {translatedName && translatedName !== dishDescription && (
                    <p className="text-xs text-muted-foreground text-center mt-1">
                      → {translatedName}
                    </p>
                  )}
                </div>
              </div>
            )}

            {!imageUrl && !isLoading && (
              <div className="bg-card/50 rounded-2xl border-2 border-dashed border-border overflow-hidden aspect-square flex items-center justify-center">
                <div className="text-center p-8">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-secondary flex items-center justify-center">
                    <ImageIcon className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground font-medium">Your generated image will appear here</p>
                  <p className="text-sm text-muted-foreground/70 mt-1">Enter a dish description and click generate</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 px-4 border-t border-border/50">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-sm text-muted-foreground">
            Powered by{" "}
            <a
              href="https://aistudio.google.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline font-medium"
            >
              Google Gemini
            </a>
            {" "}• Private Image Generation
          </p>
        </div>
      </footer>
    </div>
  );
};

export default DishGenerator;