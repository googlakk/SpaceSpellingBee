import { useState, useEffect } from 'react';
import { supabase, Language } from '@/shared/api/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Loader2, Trash2, ToggleLeft, ToggleRight, Volume2 } from 'lucide-react';
import { toast } from 'sonner';
import { VoiceSettingsDialog } from './VoiceSettingsDialog';

export const LanguageManagement = () => {
  const [languages, setLanguages] = useState<Language[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<Language | null>(null);
  const [voiceDialogOpen, setVoiceDialogOpen] = useState(false);

  // New language form state
  const [newLanguage, setNewLanguage] = useState({
    code: '',
    name: '',
    native_name: '',
    flag_emoji: '',
  });

  useEffect(() => {
    loadLanguages();
  }, []);

  const loadLanguages = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('languages')
        .select('*')
        .order('name');

      if (error) throw error;
      setLanguages(data || []);
    } catch (error) {
      console.error('Error loading languages:', error);
      toast.error('Failed to load languages');
    } finally {
      setLoading(false);
    }
  };

  const handleAddLanguage = async () => {
    if (!newLanguage.code || newLanguage.code.length !== 2) {
      toast.error('Language code must be exactly 2 characters (e.g., "en", "ru")');
      return;
    }

    if (!newLanguage.name || !newLanguage.native_name || !newLanguage.flag_emoji) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsAdding(true);

    try {
      const { error } = await supabase.from('languages').insert({
        code: newLanguage.code.toLowerCase(),
        name: newLanguage.name,
        native_name: newLanguage.native_name,
        flag_emoji: newLanguage.flag_emoji,
        is_active: true,
      });

      if (error) throw error;

      toast.success(`Language "${newLanguage.name}" added successfully!`);

      // Reset form
      setNewLanguage({
        code: '',
        name: '',
        native_name: '',
        flag_emoji: '',
      });

      // Reload languages
      loadLanguages();
    } catch (error: any) {
      console.error('Error adding language:', error);
      if (error.code === '23505') {
        toast.error('Language code already exists');
      } else {
        toast.error('Failed to add language');
      }
    } finally {
      setIsAdding(false);
    }
  };

  const handleToggleActive = async (languageId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('languages')
        .update({ is_active: !currentStatus })
        .eq('id', languageId);

      if (error) throw error;

      toast.success(`Language ${!currentStatus ? 'activated' : 'deactivated'}`);
      loadLanguages();
    } catch (error) {
      console.error('Error toggling language status:', error);
      toast.error('Failed to update language status');
    }
  };

  const handleDeleteLanguage = async (languageId: string, languageName: string) => {
    if (!confirm(`Delete language "${languageName}"? This will also delete all associated levels, sublevels, and words.`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('languages')
        .delete()
        .eq('id', languageId);

      if (error) throw error;

      toast.success(`Language "${languageName}" deleted`);
      loadLanguages();
    } catch (error) {
      console.error('Error deleting language:', error);
      toast.error('Failed to delete language. Make sure there are no levels associated with it.');
    }
  };

  const handleSaveVoiceSettings = async (voiceId: string, voiceName: string, settings: any) => {
    if (!selectedLanguage) return;

    try {
      const { error } = await supabase
        .from('languages')
        .update({
          voice_id: voiceId,
          voice_name: voiceName,
          voice_settings: settings,
        })
        .eq('id', selectedLanguage.id);

      if (error) throw error;

      toast.success(`Voice settings saved for ${selectedLanguage.name}`);
      loadLanguages();
    } catch (error) {
      console.error('Error saving voice settings:', error);
      throw error;
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
      {/* Add New Language */}
      <Card>
        <CardHeader>
          <CardTitle>Add New Language</CardTitle>
          <CardDescription>
            Create a new language for your SpellingBee trainer
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Language Code (2 letters)</Label>
                <Input
                  placeholder="en, ru, es..."
                  value={newLanguage.code}
                  onChange={(e) => setNewLanguage({ ...newLanguage, code: e.target.value })}
                  maxLength={2}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  ISO 639-1 code (e.g., en, ru, es, fr)
                </p>
              </div>

              <div>
                <Label>Flag Emoji</Label>
                <Input
                  placeholder="🇬🇧"
                  value={newLanguage.flag_emoji}
                  onChange={(e) => setNewLanguage({ ...newLanguage, flag_emoji: e.target.value })}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Flag emoji for this language
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>English Name</Label>
                <Input
                  placeholder="English, Russian, Spanish..."
                  value={newLanguage.name}
                  onChange={(e) => setNewLanguage({ ...newLanguage, name: e.target.value })}
                />
              </div>

              <div>
                <Label>Native Name</Label>
                <Input
                  placeholder="English, Русский, Español..."
                  value={newLanguage.native_name}
                  onChange={(e) => setNewLanguage({ ...newLanguage, native_name: e.target.value })}
                />
              </div>
            </div>

            <Button
              onClick={handleAddLanguage}
              disabled={isAdding}
              className="w-full"
            >
              {isAdding ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding language...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Language
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Existing Languages */}
      <Card>
        <CardHeader>
          <CardTitle>Existing Languages ({languages.length})</CardTitle>
          <CardDescription>
            Manage active languages in your system
          </CardDescription>
        </CardHeader>
        <CardContent>
          {languages.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No languages yet. Add your first language above!
            </div>
          ) : (
            <div className="space-y-3">
              {languages.map((language) => (
                <div
                  key={language.id}
                  className={`flex items-center justify-between p-4 border rounded-lg ${
                    language.is_active ? 'bg-white' : 'bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="text-4xl">{language.flag_emoji}</div>
                    <div>
                      <div className="font-semibold">
                        {language.name} ({language.code.toUpperCase()})
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {language.native_name}
                      </div>
                      <div className="text-xs mt-1">
                        {language.is_active ? (
                          <span className="text-green-600">Active</span>
                        ) : (
                          <span className="text-gray-500">Inactive</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleActive(language.id, language.is_active)}
                    >
                      {language.is_active ? (
                        <>
                          <ToggleRight className="mr-2 h-4 w-4" />
                          Deactivate
                        </>
                      ) : (
                        <>
                          <ToggleLeft className="mr-2 h-4 w-4" />
                          Activate
                        </>
                      )}
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedLanguage(language);
                        setVoiceDialogOpen(true);
                      }}
                    >
                      <Volume2 className="h-4 w-4 text-blue-500" />
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteLanguage(language.id, language.name)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <VoiceSettingsDialog
        language={selectedLanguage}
        open={voiceDialogOpen}
        onOpenChange={setVoiceDialogOpen}
        onSave={handleSaveVoiceSettings}
      />
    </div>
  );
};
