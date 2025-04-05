import { useState, useEffect } from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";

export default function VisitChecklist({ visitId, onConformityChange }) {
  const [checklist, setChecklist] = useState(null);
  const [activeCategory, setActiveCategory] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdated, setIsUpdated] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (visitId) {
      fetchChecklist();
    }
  }, [visitId]);

  // Function to determine the color based on score
  const getConformityColor = (score) => {
    if (score >= 80) return "bg-green-700"; // Green for high scores
    if (score >= 65) return "bg-emerald-600"; // Light green for good scores
    if (score >= 50) return "bg-yellow-500"; // Yellow for medium scores
    if (score >= 30) return "bg-orange-700"; // Orange for low scores
    return "bg-red-600"; // Red for very low scores
  };

  const fetchChecklist = async () => {
    try {
      const { data, error } = await supabase
        .from('support_visits')
        .select('checklist, conformity')
        .eq('id', visitId)
        .single();

      if (error) {
        throw error;
      }

      setChecklist(data.checklist);
      setActiveCategory(data.checklist.categories[0]?.id);
      
      // Notify parent about conformity value if it exists
      if (data.conformity !== null) {
        onConformityChange?.(data.conformity);
      } else if (data.checklist?.overallScore !== undefined) {
        // Use overallScore from checklist if conformity is not set
        onConformityChange?.(data.checklist.overallScore);
      }
    } catch (error) {
      console.error("Error fetching checklist:", error);
      toast({
        title: "Error",
        description: "Failed to load checklist data.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChecklistChange = (categoryId, itemId, checked) => {
    if (!checklist) return;

    const updatedChecklist = {
      ...checklist,
      categories: checklist.categories.map(category => {
        if (category.id === categoryId) {
          return {
            ...category,
            items: category.items.map(item => {
              if (item.id === itemId) {
                return { ...item, checked };
              }
              return item;
            })
          };
        }
        return category;
      })
    };

    // Calculate overall score
    let totalItems = 0;
    let checkedItems = 0;
    
    updatedChecklist.categories.forEach(category => {
      category.items.forEach(item => {
        totalItems++;
        if (item.checked) {
          checkedItems++;
        }
      });
    });
    
    const newScore = totalItems > 0 ? Math.round((checkedItems / totalItems) * 100) : 0;
    updatedChecklist.overallScore = newScore;
    
    // Notify parent about conformity change
    onConformityChange?.(newScore);
    
    setChecklist(updatedChecklist);
    setIsUpdated(true);
  };

  const saveChecklist = async () => {
    try {
      const { error } = await supabase
        .from('support_visits')
        .update({ 
          checklist,
          conformity: checklist.overallScore, // Save the score to the conformity field
          updated_at: new Date()
        })
        .eq('id', visitId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Checklist saved successfully."
      });
      
      setIsUpdated(false);
    } catch (error) {
      console.error("Error saving checklist:", error);
      toast({
        title: "Error",
        description: "Failed to save checklist. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Calculate completion percentage for a category
  const getCategoryCompletion = (categoryId) => {
    if (!checklist) return 0;
    
    const category = checklist.categories.find(cat => cat.id === categoryId);
    if (!category || category.items.length === 0) return 0;
    
    const checkedCount = category.items.filter(item => item.checked).length;
    return Math.round((checkedCount / category.items.length) * 100);
  };

  // Get category color based on completion percentage
  const getCategoryColor = (categoryId) => {
    const completion = getCategoryCompletion(categoryId);
    return getConformityColor(completion);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          Loading checklist...
        </CardContent>
      </Card>
    );
  }

  if (!checklist) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          No checklist available.
        </CardContent>
      </Card>
    );
  }

  const conformityColor = getConformityColor(checklist.overallScore);

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle>Quality Checklist</CardTitle>
          {isUpdated && (
            <Button 
              size="sm" 
              onClick={saveChecklist}
            >
              <Check className="mr-2 h-4 w-4" />
              Save
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {/* Color-coded Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-1 text-sm">
            <span className="text-muted-foreground">Conformity</span>
            <span className="font-medium">{checklist.overallScore}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
            <div 
              className={`${conformityColor} h-2.5 rounded-full transition-all duration-300 ease-in-out`} 
              style={{ width: `${checklist.overallScore}%` }}
            />
          </div>
        </div>

        <Tabs 
          value={activeCategory} 
          onValueChange={setActiveCategory}
          className="w-full"
        >
          {/* Tabs List */}
          <TabsList className="w-full grid grid-flow-col h-14 ">
            {checklist.categories.map(category => (
              <TabsTrigger 
                key={category.id} 
                value={category.id}
                className="flex flex-col"
              >
                <span>{category.name}</span>
                <div 
                  className={`px-1.5 py-0.5 text-xs rounded-full text-white ${getCategoryColor(category.id)}`}
                >
                  {getCategoryCompletion(category.id)}%
                </div>
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Tabs Content */}
          {checklist.categories.map(category => (
            <TabsContent key={category.id} value={category.id} className="pt-4">
              <div className="space-y-1">
                {category.items.map(item => (
                  <div 
                    key={item.id} 
                    className="flex items-center space-x-2 p-2 rounded-md hover:bg-muted/50"
                  >
                    <Checkbox 
                      id={`${category.id}-${item.id}`} 
                      checked={item.checked}
                      onCheckedChange={(checked) => 
                        handleChecklistChange(category.id, item.id, !!checked)
                      }
                    />
                    <label 
                      htmlFor={`${category.id}-${item.id}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex-1"
                    >
                      {item.name}
                    </label>
                  </div>
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
}