
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Funnel } from "@/utils/types";
import { useStore } from "@/utils/store";

interface DesignTabProps {
  funnel: Funnel;
}

const DesignTab = ({ funnel }: DesignTabProps) => {
  return (
    <div className="flex-1 overflow-y-auto mt-0 p-4">
      <h2 className="text-lg font-medium mb-4">Design Options</h2>
      <p className="text-muted-foreground">Customize the look and feel of your funnel</p>
      
      <Card className="mt-6">
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="primary-color">Primary Color</Label>
              <div className="flex items-center gap-3 mt-1">
                <input 
                  type="color" 
                  id="primary-color" 
                  value={funnel.settings.primaryColor} 
                  onChange={(e) => {
                    const updatedFunnel = {
                      ...funnel,
                      settings: {
                        ...funnel.settings,
                        primaryColor: e.target.value,
                      },
                    };
                    useStore.getState().updateFunnel(updatedFunnel);
                  }}
                  className="w-10 h-10 rounded-md overflow-hidden cursor-pointer"
                />
                <Input 
                  value={funnel.settings.primaryColor} 
                  onChange={(e) => {
                    const updatedFunnel = {
                      ...funnel,
                      settings: {
                        ...funnel.settings,
                        primaryColor: e.target.value,
                      },
                    };
                    useStore.getState().updateFunnel(updatedFunnel);
                  }}
                  className="w-32"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="background-color">Background Color</Label>
              <div className="flex items-center gap-3 mt-1">
                <input 
                  type="color" 
                  id="background-color" 
                  value={funnel.settings.backgroundColor} 
                  onChange={(e) => {
                    const updatedFunnel = {
                      ...funnel,
                      settings: {
                        ...funnel.settings,
                        backgroundColor: e.target.value,
                      },
                    };
                    useStore.getState().updateFunnel(updatedFunnel);
                  }}
                  className="w-10 h-10 rounded-md overflow-hidden cursor-pointer"
                />
                <Input 
                  value={funnel.settings.backgroundColor} 
                  onChange={(e) => {
                    const updatedFunnel = {
                      ...funnel,
                      settings: {
                        ...funnel.settings,
                        backgroundColor: e.target.value,
                      },
                    };
                    useStore.getState().updateFunnel(updatedFunnel);
                  }}
                  className="w-32"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DesignTab;
