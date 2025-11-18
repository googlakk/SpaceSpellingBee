import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { LanguageManagement } from '@/widgets/admin/language-management/ui/LanguageManagement';
import { LevelsManagement } from '@/widgets/admin/levels/ui/LevelsManagement';
import { WordsImport } from '@/widgets/admin/words-import/ui/WordsImport';
import { AudioUpload } from '@/widgets/admin/audio-upload/ui/AudioUpload';
import { WordAdd } from '@/widgets/admin/word-add/ui/WordAdd';
import { ConfigManagement } from '@/widgets/admin/config/ui/ConfigManagement';

export const AdminDashboardPage = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const auth = localStorage.getItem('admin_authenticated');
    if (auth !== 'true') {
      navigate('/admin/login');
    } else {
      setIsAuthenticated(true);
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('admin_authenticated');
    navigate('/admin/login');
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="h-screen bg-gradient-cosmic stars-bg flex flex-col overflow-hidden">
      <div className="flex-shrink-0 border-b glass-card backdrop-blur-xl shadow-large">
        <div className="container mx-auto px-3 md:px-4 py-2 md:py-3 flex justify-between items-center">
          <h1 className="text-base md:text-xl lg:text-2xl font-bold text-glow-cyan font-display">Admin Dashboard</h1>
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="h-8 md:h-9 px-2 md:px-3 text-xs md:text-sm rounded-full glass-card border-primary/30 hover:border-primary hover:bg-primary/10"
          >
            <LogOut className="mr-1 md:mr-2 h-3 w-3 md:h-4 md:w-4" />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </div>
      </div>

      <div className="flex-1 container mx-auto px-3 md:px-4 py-3 md:py-6 overflow-y-auto">
        <Tabs defaultValue="config" className="w-full">
          <TabsList className="grid w-full grid-cols-3 md:grid-cols-6 gap-1 md:gap-0 max-w-5xl h-auto md:h-10 bg-muted/50 p-1">
            <TabsTrigger value="config" className="text-xs md:text-sm h-8 md:h-9">Config</TabsTrigger>
            <TabsTrigger value="languages" className="text-xs md:text-sm h-8 md:h-9">Languages</TabsTrigger>
            <TabsTrigger value="levels" className="text-xs md:text-sm h-8 md:h-9">
              <span className="hidden md:inline">Levels & Sublevels</span>
              <span className="md:hidden">Levels</span>
            </TabsTrigger>
            <TabsTrigger value="add-word" className="text-xs md:text-sm h-8 md:h-9">
              <span className="hidden md:inline">Add Words</span>
              <span className="md:hidden">Add</span>
            </TabsTrigger>
            <TabsTrigger value="import" className="text-xs md:text-sm h-8 md:h-9">
              <span className="hidden md:inline">Import Words</span>
              <span className="md:hidden">Import</span>
            </TabsTrigger>
            <TabsTrigger value="audio" className="text-xs md:text-sm h-8 md:h-9">
              <span className="hidden md:inline">Upload Audio</span>
              <span className="md:hidden">Audio</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="config" className="mt-3 md:mt-6">
            <ConfigManagement />
          </TabsContent>

          <TabsContent value="languages" className="mt-3 md:mt-6">
            <LanguageManagement />
          </TabsContent>

          <TabsContent value="levels" className="mt-3 md:mt-6">
            <LevelsManagement />
          </TabsContent>

          <TabsContent value="add-word" className="mt-3 md:mt-6">
            <WordAdd />
          </TabsContent>

          <TabsContent value="import" className="mt-3 md:mt-6">
            <WordsImport />
          </TabsContent>

          <TabsContent value="audio" className="mt-3 md:mt-6">
            <AudioUpload />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
