import { useEffect, useState } from 'react';
import { supabase, Level, Sublevel, Language } from '@/shared/api/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

export const LevelsManagement = () => {
  const [levels, setLevels] = useState<Level[]>([]);
  const [languages, setLanguages] = useState<Language[]>([]);
  const [sublevels, setSublevels] = useState<Record<string, Sublevel[]>>({});
  const [loading, setLoading] = useState(true);
  const [isCreatingLevel, setIsCreatingLevel] = useState(false);
  const [newLevel, setNewLevel] = useState({
    name: '',
    displayName: '',
    description: '',
    languageId: '',
  });
  const [newSublevel, setNewSublevel] = useState({
    levelId: '',
    name: '',
    displayName: '',
    description: '',
  });

  useEffect(() => {
    loadLanguages();
    loadLevels();
  }, []);

  const loadLanguages = async () => {
    try {
      const { data, error } = await supabase
        .from('languages')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setLanguages(data || []);
    } catch (error) {
      console.error('Error loading languages:', error);
      toast.error('Failed to load languages');
    }
  };

  const loadLevels = async () => {
    try {
      const { data: levelsData, error: levelsError } = await supabase
        .from('levels')
        .select('*, languages(code, name, flag_emoji)')
        .order('name');

      if (levelsError) throw levelsError;

      setLevels(levelsData || []);

      // Load sublevels for each level
      const sublevelsMap: Record<string, Sublevel[]> = {};
      for (const level of levelsData || []) {
        const { data: sublevelsData, error: sublevelsError } = await supabase
          .from('sublevels')
          .select('*')
          .eq('level_id', level.id)
          .order('order_index');

        if (sublevelsError) throw sublevelsError;
        sublevelsMap[level.id] = sublevelsData || [];
      }

      setSublevels(sublevelsMap);
    } catch (error) {
      console.error('Error loading levels:', error);
      toast.error('Failed to load levels');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateLevel = async () => {
    if (!newLevel.name || !newLevel.displayName || !newLevel.languageId) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsCreatingLevel(true);

    try {
      const { error } = await supabase.from('levels').insert({
        name: newLevel.name,
        display_name: newLevel.displayName,
        description: newLevel.description || null,
        language_id: newLevel.languageId,
      });

      if (error) throw error;

      toast.success(`Level "${newLevel.displayName}" created successfully!`);
      setNewLevel({
        name: '',
        displayName: '',
        description: '',
        languageId: '',
      });
      loadLevels();
    } catch (error) {
      console.error('Error creating level:', error);
      toast.error('Failed to create level');
    } finally {
      setIsCreatingLevel(false);
    }
  };

  const handleDeleteLevel = async (levelId: string, levelName: string) => {
    try {
      // Get all sublevel IDs for this level
      const { data: levelSublevels, error: sublevelsError } = await supabase
        .from('sublevels')
        .select('id')
        .eq('level_id', levelId);

      if (sublevelsError) throw sublevelsError;

      const sublevelIds = levelSublevels?.map(s => s.id) || [];

      // Count total words across all sublevels
      let totalWords = 0;
      if (sublevelIds.length > 0) {
        const { count, error: countError } = await supabase
          .from('words')
          .select('*', { count: 'exact', head: true })
          .in('sublevel_id', sublevelIds);

        if (countError) throw countError;
        totalWords = count || 0;
      }

      const sublevelCount = sublevelIds.length;

      // Show detailed confirmation
      const confirmMessage =
        `⚠️ DELETE LEVEL "${levelName}"?\n\n` +
        `This will permanently delete:\n` +
        `• ${sublevelCount} sublevel${sublevelCount === 1 ? '' : 's'}\n` +
        `• ${totalWords} word${totalWords === 1 ? '' : 's'}\n\n` +
        `This action CANNOT be undone!\n\n` +
        `Are you absolutely sure?`;

      if (!confirm(confirmMessage)) {
        return;
      }

      const { error } = await supabase.from('levels').delete().eq('id', levelId);

      if (error) throw error;

      toast.success(
        `Level "${levelName}" deleted successfully ` +
        `(${sublevelCount} sublevel${sublevelCount === 1 ? '' : 's'}, ${totalWords} word${totalWords === 1 ? '' : 's'})`
      );
      loadLevels();
    } catch (error) {
      console.error('Error deleting level:', error);
      toast.error('Failed to delete level');
    }
  };

  const handleCreateSublevel = async (levelId: string) => {
    if (!newSublevel.name || !newSublevel.displayName) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const maxOrder = Math.max(...(sublevels[levelId]?.map(s => s.order_index) || [0]), 0);

      const { error } = await supabase.from('sublevels').insert({
        level_id: levelId,
        name: newSublevel.name,
        display_name: newSublevel.displayName,
        description: newSublevel.description || null,
        order_index: maxOrder + 1,
      });

      if (error) throw error;

      toast.success('Sublevel created successfully');
      setNewSublevel({ levelId: '', name: '', displayName: '', description: '' });
      loadLevels();
    } catch (error) {
      console.error('Error creating sublevel:', error);
      toast.error('Failed to create sublevel');
    }
  };

  const handleDeleteSublevel = async (sublevelId: string, sublevelName: string) => {
    try {
      // First, count how many words will be deleted
      const { count, error: countError } = await supabase
        .from('words')
        .select('*', { count: 'exact', head: true })
        .eq('sublevel_id', sublevelId);

      if (countError) throw countError;

      const wordCount = count || 0;

      // Show confirmation with word count
      const confirmMessage = wordCount > 0
        ? `⚠️ Delete sublevel "${sublevelName}"?\n\nThis will permanently delete ${wordCount} word${wordCount === 1 ? '' : 's'}.\n\nThis action cannot be undone.`
        : `Delete sublevel "${sublevelName}"?\n\nThere are no words in this sublevel.`;

      if (!confirm(confirmMessage)) {
        return;
      }

      const { error } = await supabase.from('sublevels').delete().eq('id', sublevelId);

      if (error) throw error;

      toast.success(`Sublevel deleted successfully${wordCount > 0 ? ` (${wordCount} word${wordCount === 1 ? '' : 's'} removed)` : ''}`);
      loadLevels();
    } catch (error) {
      console.error('Error deleting sublevel:', error);
      toast.error('Failed to delete sublevel');
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Add New Level */}
      <Card>
        <CardHeader>
          <CardTitle>Add New Level</CardTitle>
          <CardDescription>
            Create a custom level for any language. You can name it however you want (e.g., Kids, Beginners, Балдар, etc.)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div>
              <Label>Language</Label>
              <Select value={newLevel.languageId} onValueChange={(v) => setNewLevel({ ...newLevel, languageId: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  {languages.map((lang) => (
                    <SelectItem key={lang.id} value={lang.id}>
                      {lang.flag_emoji} {lang.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Level Name (ID)</Label>
                <Input
                  placeholder="e.g., kids, beginners, балдар"
                  value={newLevel.name}
                  onChange={(e) => setNewLevel({ ...newLevel, name: e.target.value.toLowerCase().replace(/\s+/g, '_') })}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Internal identifier (lowercase, no spaces)
                </p>
              </div>

              <div>
                <Label>Display Name</Label>
                <Input
                  placeholder="e.g., Kids Level, Балдар Деңгээли"
                  value={newLevel.displayName}
                  onChange={(e) => setNewLevel({ ...newLevel, displayName: e.target.value })}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Name shown to users
                </p>
              </div>
            </div>

            <div>
              <Label>Description (Optional)</Label>
              <Textarea
                placeholder="Description..."
                value={newLevel.description}
                onChange={(e) => setNewLevel({ ...newLevel, description: e.target.value })}
              />
            </div>

            <Button onClick={handleCreateLevel} disabled={isCreatingLevel} className="w-full">
              {isCreatingLevel ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating level...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Level
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Existing Levels */}
      <Card>
        <CardHeader>
          <CardTitle>Existing Levels & Sublevels</CardTitle>
          <CardDescription>
            Manage existing levels and their sublevels
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {levels.map((level: any) => (
              <AccordionItem key={level.id} value={level.id}>
                <AccordionTrigger className="text-lg font-semibold">
                  <div className="flex items-center justify-between w-full pr-4">
                    <div className="flex items-center gap-2">
                      <span>{level.languages?.flag_emoji || '🏳️'}</span>
                      <span>{level.display_name}</span>
                      <span className="ml-2 text-sm text-gray-500">
                        ({sublevels[level.id]?.length || 0} sublevels)
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteLevel(level.id, level.display_name);
                      }}
                      className="mr-2"
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4 pt-4">
                    {/* Existing Sublevels */}
                    <div className="space-y-2">
                      {sublevels[level.id]?.map((sublevel) => (
                        <div
                          key={sublevel.id}
                          className="flex items-center justify-between p-3 border rounded-lg bg-gray-50"
                        >
                          <div className="flex-1">
                            <div className="font-medium">{sublevel.display_name}</div>
                            <div className="text-sm text-gray-500">{sublevel.name}</div>
                            {sublevel.description && (
                              <div className="text-sm text-gray-600 mt-1">
                                {sublevel.description}
                              </div>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteSublevel(sublevel.id, sublevel.display_name)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      ))}
                    </div>

                    {/* Add New Sublevel Form */}
                    <div className="border-t pt-4">
                      <h4 className="font-medium mb-3">Add New Sublevel</h4>
                      <div className="grid gap-3">
                        <div>
                          <Label htmlFor={`name-${level.id}`}>Name (ID)</Label>
                          <Input
                            id={`name-${level.id}`}
                            placeholder="e.g., level_1"
                            value={newSublevel.levelId === level.id ? newSublevel.name : ''}
                            onChange={(e) =>
                              setNewSublevel({
                                ...newSublevel,
                                levelId: level.id,
                                name: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div>
                          <Label htmlFor={`display-${level.id}`}>Display Name</Label>
                          <Input
                            id={`display-${level.id}`}
                            placeholder="e.g., Level 1"
                            value={newSublevel.levelId === level.id ? newSublevel.displayName : ''}
                            onChange={(e) =>
                              setNewSublevel({
                                ...newSublevel,
                                levelId: level.id,
                                displayName: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div>
                          <Label htmlFor={`desc-${level.id}`}>Description (Optional)</Label>
                          <Textarea
                            id={`desc-${level.id}`}
                            placeholder="Description..."
                            value={newSublevel.levelId === level.id ? newSublevel.description : ''}
                            onChange={(e) =>
                              setNewSublevel({
                                ...newSublevel,
                                levelId: level.id,
                                description: e.target.value,
                              })
                            }
                          />
                        </div>
                        <Button
                          onClick={() => handleCreateSublevel(level.id)}
                          className="w-full"
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Add Sublevel
                        </Button>
                      </div>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
};
