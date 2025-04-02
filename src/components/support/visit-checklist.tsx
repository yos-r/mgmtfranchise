import { useState, useEffect } from "react";
import { Check, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";

export default function VisitChecklist({ visitId }) {
  const [checklist, setChecklist] = useState(null);
  const [activeCategoryIndex, setActiveCategoryIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdated, setIsUpdated] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (visitId) {
      fetchChecklist();
    }
  }, [visitId]);

  const fetchChecklist = async () => {
    try {
      const { data, error } = await supabase
        .from('support_visits')
        .select('checklist')
        .eq('id', visitId)
        .single();

      if (error) {
        throw error;
      }

      setChecklist(data.checklist);
      setActiveCategoryIndex(0);
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
    
    updatedChecklist.overallScore = totalItems > 0 ? Math.round((checkedItems / totalItems) * 100) : 0;
    
    setChecklist(updatedChecklist);
    setIsUpdated(true);
  };

  const saveChecklist = async () => {
    try {
      const { error } = await supabase
        .from('support_visits')
        .update({ 
          checklist,
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

  const navigateCategory = (direction) => {
    if (!checklist || !checklist.categories) return;
    
    let newIndex = activeCategoryIndex + direction;
    
    if (newIndex < 0) {
      newIndex = checklist.categories.length - 1;
    } else if (newIndex >= checklist.categories.length) {
      newIndex = 0;
    }
    
    setActiveCategoryIndex(newIndex);
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

  const activeCategory = checklist.categories[activeCategoryIndex];

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
        {/* Simple Minimal Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-1 text-sm">
            <span className="text-muted-foreground">Conformity</span>
            <span className="font-medium">{checklist.overallScore}%</span>
          </div>
          <Progress value={checklist.overallScore} className="h-2" />
        </div>

        <div className="flex flex-col space-y-3">
          {/* Minimalist Tab Navigation with Arrows */}
          <div className="flex items-center justify-between">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigateCategory(-1)}
              className="h-8 w-8"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <div className="flex items-center space-x-2">
              <h3 className="text-sm font-medium">{activeCategory.name}</h3>
              <div className="px-1.5 py-0.5 text-xs rounded-full bg-muted">
                {getCategoryCompletion(activeCategory.id)}%
              </div>
            </div>
            
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigateCategory(1)}
              className="h-8 w-8"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Small indicators for all categories */}
          <div className="flex justify-center space-x-1 py-1">
            {checklist.categories.map((category, index) => (
              <button
                key={category.id}
                onClick={() => setActiveCategoryIndex(index)}
                className={`w-2 h-2 rounded-full ${
                  index === activeCategoryIndex 
                    ? "bg-primary" 
                    : "bg-muted-foreground/30"
                }`}
                aria-label={`Go to ${category.name}`}
              />
            ))}
          </div>
          
          {/* Category Content */}
          <div className="pt-1">
            <div className="space-y-1">
              {activeCategory.items.map(item => (
                <div key={item.id} className="flex items-center space-x-2 p-2 rounded-md hover:bg-muted/50">
                  <Checkbox 
                    id={`${activeCategory.id}-${item.id}`} 
                    checked={item.checked}
                    onCheckedChange={(checked) => 
                      handleChecklistChange(activeCategory.id, item.id, !!checked)
                    }
                  />
                  <label 
                    htmlFor={`${activeCategory.id}-${item.id}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex-1"
                  >
                    {item.name}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}