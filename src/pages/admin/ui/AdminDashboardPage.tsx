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
    <div className="min-h-screen bg-gray-50">
      <div className="border-b bg-white">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="config" className="w-full">
          <TabsList className="grid w-full grid-cols-6 max-w-5xl">
            <TabsTrigger value="config">Config</TabsTrigger>
            <TabsTrigger value="languages">Languages</TabsTrigger>
            <TabsTrigger value="levels">Levels & Sublevels</TabsTrigger>
            <TabsTrigger value="add-word">Add Words</TabsTrigger>
            <TabsTrigger value="import">Import Words</TabsTrigger>
            <TabsTrigger value="audio">Upload Audio</TabsTrigger>
          </TabsList>

          <TabsContent value="config" className="mt-6">
            <ConfigManagement />
          </TabsContent>

          <TabsContent value="languages" className="mt-6">
            <LanguageManagement />
          </TabsContent>

          <TabsContent value="levels" className="mt-6">
            <LevelsManagement />
          </TabsContent>

          <TabsContent value="add-word" className="mt-6">
            <WordAdd />
          </TabsContent>

          <TabsContent value="import" className="mt-6">
            <WordsImport />
          </TabsContent>

          <TabsContent value="audio" className="mt-6">
            <AudioUpload />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
