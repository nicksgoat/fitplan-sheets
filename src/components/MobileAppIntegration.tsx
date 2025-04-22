import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Upload, PlusCircle, Trash2, Edit } from 'lucide-react';
import { toast } from 'sonner';
import { mobileApi } from '@/lib/mobileApiClient';
import { useAuth } from '@/hooks/useAuth';

const API_DEMOS = [
  { id: 'create-program', name: 'Create Program', action: 'create' },
  { id: 'update-program', name: 'Update Program', action: 'update' },
  { id: 'delete-program', name: 'Delete Program', action: 'delete' },
  { id: 'create-workout', name: 'Create Workout', action: 'create' },
  { id: 'update-workout', name: 'Update Workout', action: 'update' },
  { id: 'delete-workout', name: 'Delete Workout', action: 'delete' },
  { id: 'upload-media', name: 'Upload Media', action: 'upload' }
];

interface Program {
  id: string;
  name: string;
  weeks?: Week[];
}

interface Week {
  id: string;
  name: string;
  workouts?: Workout[];
}

interface Workout {
  id: string;
  name: string;
}

export default function MobileAppIntegration() {
  const { user } = useAuth();
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeDemo, setActiveDemo] = useState<string>('create-program');
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [result, setResult] = useState<any>(null);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [file, setFile] = useState<File | null>(null);
  
  useEffect(() => {
    const init = async () => {
      try {
        const success = await mobileApi.initialize();
        setIsInitialized(success);
        if (success) {
          loadData();
        }
      } catch (error) {
        console.error('Failed to initialize mobile API client', error);
        toast.error('Failed to initialize mobile API client');
      }
    };
    
    if (user) {
      init();
    }
  }, [user]);
  
  const loadData = async () => {
    try {
      setIsLoading(true);
      const programsResponse = await mobileApi.getPrograms();
      const programsData = programsResponse as { data: Program[] };
      setPrograms(programsData.data || []);
      
      if (programsData.data && programsData.data.length > 0) {
        const firstProgram = programsData.data[0];
        const programDetailsResponse = await mobileApi.getProgram(firstProgram.id);
        const programDetails = programDetailsResponse as { data: Program };
        
        const allWorkouts: Workout[] = [];
        if (programDetails.data && programDetails.data.weeks) {
          programDetails.data.weeks.forEach((week: Week) => {
            if (week.workouts) {
              allWorkouts.push(...week.workouts);
            }
          });
        }
        setWorkouts(allWorkouts);
      }
    } catch (error) {
      console.error('Failed to load data', error);
      toast.error('Failed to load initial data');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleInputChange = (key: string, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      toast.info(`Selected file: ${selectedFile.name}`);
    }
  };
  
  const handleActionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isInitialized) {
      toast.error('API client not initialized');
      return;
    }
    
    setIsLoading(true);
    setResult(null);
    
    try {
      let response;
      
      switch (activeDemo) {
        case 'create-program':
          response = await mobileApi.createProgram({
            name: formData.name || 'New Program',
            is_public: formData.is_public === 'true'
          });
          break;
          
        case 'update-program':
          if (!formData.id) {
            throw new Error('Program ID is required');
          }
          response = await mobileApi.updateProgram(formData.id, {
            name: formData.name,
            is_public: formData.is_public === 'true'
          });
          break;
          
        case 'delete-program':
          if (!formData.id) {
            throw new Error('Program ID is required');
          }
          response = await mobileApi.deleteProgram(formData.id);
          break;
          
        case 'create-workout':
          if (!formData.week_id) {
            throw new Error('Week ID is required');
          }
          response = await mobileApi.createWorkout({
            name: formData.name || 'New Workout',
            week_id: formData.week_id,
            day_num: parseInt(formData.day_num || '1', 10)
          });
          break;
          
        case 'update-workout':
          if (!formData.id) {
            throw new Error('Workout ID is required');
          }
          response = await mobileApi.updateWorkout(formData.id, {
            name: formData.name,
            day_num: formData.day_num ? parseInt(formData.day_num, 10) : undefined
          });
          break;
          
        case 'delete-workout':
          if (!formData.id) {
            throw new Error('Workout ID is required');
          }
          response = await mobileApi.deleteWorkout(formData.id);
          break;
          
        case 'upload-media':
          if (!file) {
            throw new Error('Please select a file');
          }
          response = await mobileApi.uploadFile(
            file,
            (formData.media_type as 'workout' | 'profile' | 'exercise') || 'workout',
            formData.related_id
          );
          break;
          
        default:
          throw new Error('Unknown action');
      }
      
      setResult(response);
      toast.success('Action completed successfully');
      
      loadData();
      
    } catch (error: any) {
      console.error('Action failed:', error);
      toast.error(`Action failed: ${error.message}`);
      setResult({ error: error.message });
    } finally {
      setIsLoading(false);
    }
  };
  
  const renderForm = () => {
    switch (activeDemo) {
      case 'create-program':
        return (
          <>
            <div className="space-y-2">
              <label className="text-sm font-medium">Program Name</label>
              <Input 
                value={formData.name || ''} 
                onChange={(e) => handleInputChange('name', e.target.value)} 
                placeholder="My New Program" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Public?</label>
              <select 
                className="w-full p-2 border rounded bg-dark-200"
                value={formData.is_public || 'false'}
                onChange={(e) => handleInputChange('is_public', e.target.value)}
              >
                <option value="true">Yes</option>
                <option value="false">No</option>
              </select>
            </div>
          </>
        );
        
      case 'update-program':
      case 'delete-program':
        return (
          <>
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Program</label>
              <select 
                className="w-full p-2 border rounded bg-dark-200"
                value={formData.id || ''}
                onChange={(e) => handleInputChange('id', e.target.value)}
              >
                <option value="">Select a program...</option>
                {programs.map(program => (
                  <option key={program.id} value={program.id}>{program.name}</option>
                ))}
              </select>
            </div>
            
            {activeDemo === 'update-program' && (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium">New Program Name</label>
                  <Input 
                    value={formData.name || ''} 
                    onChange={(e) => handleInputChange('name', e.target.value)} 
                    placeholder="Updated Program Name" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Public?</label>
                  <select 
                    className="w-full p-2 border rounded bg-dark-200"
                    value={formData.is_public || 'false'}
                    onChange={(e) => handleInputChange('is_public', e.target.value)}
                  >
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                </div>
              </>
            )}
          </>
        );
        
      case 'create-workout':
        return (
          <>
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Week</label>
              <select 
                className="w-full p-2 border rounded bg-dark-200"
                value={formData.week_id || ''}
                onChange={(e) => handleInputChange('week_id', e.target.value)}
              >
                <option value="">Select a week...</option>
                {programs.flatMap(program => 
                  (program.weeks || []).map((week: Week) => (
                    <option key={week.id} value={week.id}>{program.name} - {week.name}</option>
                  ))
                )}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Workout Name</label>
              <Input 
                value={formData.name || ''} 
                onChange={(e) => handleInputChange('name', e.target.value)} 
                placeholder="New Workout" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Day Number</label>
              <Input 
                value={formData.day_num || '1'} 
                onChange={(e) => handleInputChange('day_num', e.target.value)} 
                placeholder="1" 
                type="number"
                min="1"
              />
            </div>
          </>
        );
        
      case 'update-workout':
      case 'delete-workout':
        return (
          <>
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Workout</label>
              <select 
                className="w-full p-2 border rounded bg-dark-200"
                value={formData.id || ''}
                onChange={(e) => handleInputChange('id', e.target.value)}
              >
                <option value="">Select a workout...</option>
                {workouts.map(workout => (
                  <option key={workout.id} value={workout.id}>{workout.name}</option>
                ))}
              </select>
            </div>
            
            {activeDemo === 'update-workout' && (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium">New Workout Name</label>
                  <Input 
                    value={formData.name || ''} 
                    onChange={(e) => handleInputChange('name', e.target.value)} 
                    placeholder="Updated Workout Name" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Day Number</label>
                  <Input 
                    value={formData.day_num || ''} 
                    onChange={(e) => handleInputChange('day_num', e.target.value)} 
                    placeholder="Day Number" 
                    type="number"
                    min="1"
                  />
                </div>
              </>
            )}
          </>
        );
        
      case 'upload-media':
        return (
          <>
            <div className="space-y-2">
              <label className="text-sm font-medium">Media Type</label>
              <select 
                className="w-full p-2 border rounded bg-dark-200"
                value={formData.media_type || 'workout'}
                onChange={(e) => handleInputChange('media_type', e.target.value)}
              >
                <option value="workout">Workout</option>
                <option value="profile">Profile</option>
                <option value="exercise">Exercise</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Related ID (optional)</label>
              <Input 
                value={formData.related_id || ''} 
                onChange={(e) => handleInputChange('related_id', e.target.value)} 
                placeholder="UUID of related item" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">File</label>
              <div className="border border-dashed rounded-lg p-4 text-center hover:bg-dark-300 cursor-pointer">
                <input
                  type="file"
                  id="file-upload"
                  className="hidden"
                  onChange={handleFileChange}
                />
                <label htmlFor="file-upload" className="cursor-pointer w-full h-full flex flex-col items-center justify-center">
                  <Upload className="h-6 w-6 mb-2" />
                  <span className="text-sm">
                    {file ? file.name : "Click to select a file"}
                  </span>
                </label>
              </div>
            </div>
          </>
        );
        
      default:
        return <p>Please select an action.</p>;
    }
  };
  
  if (!user) {
    return (
      <Card className="w-full bg-dark-100">
        <CardContent className="p-6">
          <p className="text-center">Please sign in to use the mobile API integration.</p>
        </CardContent>
      </Card>
    );
  }
  
  const getActionIcon = (action: string) => {
    switch (action) {
      case 'create': return <PlusCircle className="h-4 w-4" />;
      case 'update': return <Edit className="h-4 w-4" />;
      case 'delete': return <Trash2 className="h-4 w-4" />;
      case 'upload': return <Upload className="h-4 w-4" />;
      default: return null;
    }
  };
  
  return (
    <Card className="w-full bg-dark-100">
      <CardHeader>
        <CardTitle className="text-xl font-bold">
          Mobile API Integration
        </CardTitle>
      </CardHeader>
      <CardContent className="pb-0">
        <Tabs defaultValue={activeDemo} value={activeDemo} onValueChange={setActiveDemo}>
          <TabsList className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
            {API_DEMOS.map(demo => (
              <TabsTrigger 
                key={demo.id} 
                value={demo.id}
                className="flex items-center"
              >
                {getActionIcon(demo.action)}
                <span className="ml-1">{demo.name}</span>
              </TabsTrigger>
            ))}
          </TabsList>
          
          <div className="space-y-4 p-4 border rounded-lg">
            <form onSubmit={handleActionSubmit} className="space-y-4">
              {renderForm()}
              <Button 
                type="submit" 
                disabled={isLoading || !isInitialized}
                className="w-full bg-fitbloom-purple hover:bg-fitbloom-purple/90"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : 'Execute API Call'}
              </Button>
            </form>
            
            {result && (
              <div className="mt-4">
                <h3 className="text-sm font-medium mb-2">Result:</h3>
                <pre className="bg-dark-300 p-4 rounded overflow-x-auto text-xs">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </Tabs>
      </CardContent>
    </Card>
  );
}
