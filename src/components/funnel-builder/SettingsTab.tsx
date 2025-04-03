
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Funnel } from "@/utils/types";
import { useStore } from "@/utils/store";

interface SettingsTabProps {
  funnel: Funnel;
}

const SettingsTab = ({ funnel }: SettingsTabProps) => {
  return (
    <div className="flex-1 overflow-y-auto mt-0 p-4">
      <h2 className="text-lg font-medium mb-4">Funnel Settings</h2>
      <p className="text-muted-foreground">Configure general settings for your funnel</p>
      
      <Card className="mt-6">
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="show-progress">Show Progress Bar</Label>
                <p className="text-sm text-muted-foreground">Display progress bar in the funnel</p>
              </div>
              <div className="flex items-center h-8">
                <input 
                  type="checkbox" 
                  id="show-progress" 
                  checked={funnel.settings.showProgressBar}
                  onChange={(e) => {
                    const updatedFunnel = {
                      ...funnel,
                      settings: {
                        ...funnel.settings,
                        showProgressBar: e.target.checked,
                      },
                    };
                    useStore.getState().updateFunnel(updatedFunnel);
                  }}
                  className="h-4 w-4"
                />
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="collect-lead">Collect Lead Data</Label>
                <p className="text-sm text-muted-foreground">Collect name, email and phone number</p>
              </div>
              <div className="flex items-center h-8">
                <input 
                  type="checkbox" 
                  id="collect-lead" 
                  checked={funnel.settings.collectLeadData}
                  onChange={(e) => {
                    const updatedFunnel = {
                      ...funnel,
                      settings: {
                        ...funnel.settings,
                        collectLeadData: e.target.checked,
                      },
                    };
                    useStore.getState().updateFunnel(updatedFunnel);
                  }}
                  className="h-4 w-4"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="mt-8 flex justify-end">
        <Button variant="outline" className="mr-2">
          Cancel
        </Button>
        <Button>
          Save Settings
        </Button>
      </div>
    </div>
  );
};

export default SettingsTab;
