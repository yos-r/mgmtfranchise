import { Building, MapPin, User, Phone, Mail, Users, ExternalLink, Building2, Plus, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

export default function FranchiseInfoCard({ franchise, consultant, agents: initialAgents }) {
  if (!franchise) return null;

  // Static data - in a real app, this would come from props
  const [agents, setAgents] = useState(initialAgents || [
    "John Smith",
    "Maria Garcia",
    "Robert Johnson"
  ]);

  const [newAgent, setNewAgent] = useState("");
  const [isAddingAgent, setIsAddingAgent] = useState(false);

  // Get the first letters of franchise name for avatar fallback
  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const handleAddAgent = () => {
    if (newAgent.trim()) {
      setAgents([...agents, newAgent.trim()]);
      setNewAgent("");
      setIsAddingAgent(false);
    }
  };

  const handleRemoveAgent = (indexToRemove) => {
    setAgents(agents.filter((_, index) => index !== indexToRemove));
  };

  return (
    <Card className="overflow-hidden">
      <div className="flex items-center justify-between p-6 pb-0">
        <div className="flex items-center space-x-4">
          {franchise.logo ? (
            <img
              src={franchise.logo}
              alt={franchise.name}
              className="h-16 w-16 rounded-lg object-cover"
            />
          ) : (
            <div className="h-16 w-16 rounded-lg bg-muted flex items-center justify-center">
              <Building2 className="h-8 w-8 text-muted-foreground" />
            </div>
          )}
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-bold">{franchise.name}</h1>
              {franchise.status === 'terminated' && (
                <Badge variant="destructive">Terminated</Badge>
              )}
            </div>
            <p className="text-muted-foreground">{franchise.company_name}</p>
          </div>
        </div>
      </div>

      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1">
            <h3 className="text-lg font-medium mb-3">Franchise Details</h3>

            <div className="space-y-2">
              {franchise.company_name && franchise.company_name !== franchise.name && (
                <div className="flex items-center">
                  <Building className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="text-sm">{franchise.company_name}</span>
                </div>
              )}

              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-2 text-muted-foreground flex-shrink-0" />
                <span className="text-sm">{franchise.address}</span>
              </div>

              {franchise.tax_id && (
                <div className="flex items-center">
                  <span className="w-4 h-4 mr-2 flex justify-center items-center text-xs rounded bg-muted text-muted-foreground">
                    #
                  </span>
                  <span className="text-sm">Tax ID: {franchise.tax_id}</span>
                </div>
              )}
            </div>

            <Separator className="my-4" />

            <h3 className="text-lg font-medium mb-3">Owner Information</h3>
            <div className="flex items-start space-x-3">
              {franchise.owner_avatar ? (
                <Avatar className="h-10 w-10">
                  <AvatarImage src={franchise.owner_avatar} alt={franchise.owner_name} />
                  <AvatarFallback>{getInitials(franchise.owner_name)}</AvatarFallback>
                </Avatar>
              ) : (
                <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                  <User className="h-5 w-5 text-muted-foreground" />
                </div>
              )}

              <div>
                <div className="font-medium">{franchise.owner_name}</div>
                <div className="flex flex-col space-y-1 mt-1">
                  {franchise.owner_email && (
                    <a
                      href={`mailto:${franchise.owner_email}`}
                      className="text-xs text-gray-600 hover:underline flex items-center"
                    >
                      <Mail className="h-3 w-3 mr-1" />
                      {franchise.owner_email}
                    </a>
                  )}

                  {franchise.owner_phone && (
                    <a
                      href={`tel:${franchise.owner_phone}`}
                      className="text-xs text-darkgold hover:underline flex items-center"
                    >
                      <Phone className="h-3 w-3 mr-1" />
                      {franchise.owner_phone}
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1">
            <div className="mb-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-medium flex items-center">
                  <Users className="h-4 w-4 mr-2" />
                  Present Agents ({agents.length})
                </h3>

                {!isAddingAgent ? (
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex items-center gap-1"
                    onClick={() => setIsAddingAgent(true)}
                  >
                    <Plus className="h-3 w-3" />
                    Add Agent
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setIsAddingAgent(false)}
                  >
                    Cancel
                  </Button>
                )}
              </div>

              {isAddingAgent && (
                <div className="flex gap-2 mb-3">
                  <Input
                    placeholder="Enter agent name"
                    value={newAgent}
                    onChange={(e) => setNewAgent(e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    onClick={handleAddAgent}
                    disabled={!newAgent.trim()}
                  >
                    Add
                  </Button>
                </div>
              )}

              <div className="grid grid-cols-1 gap-2 max-h-64 overflow-y-auto">
                {agents.length > 0 ? (
                  agents.map((agent, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 rounded-md bg-muted/40 group"
                    >
                      <div className="flex items-center">
                        <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center mr-2">
                          <User className="h-3 w-3 text-muted-foreground" />
                        </div>
                        <span className="text-sm">{agent}</span>
                      </div>

                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => handleRemoveAgent(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-muted-foreground text-center py-4">
                    No agents added yet
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}