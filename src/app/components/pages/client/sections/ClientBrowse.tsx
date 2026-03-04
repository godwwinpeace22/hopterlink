import { useNavigate } from "react-router-dom";
import { Button } from "../../../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../ui/card";
import { Input } from "../../../ui/input";
import { Search } from "lucide-react";

export const ClientBrowse = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Find Service Providers</CardTitle>
          <CardDescription>Search for local professionals</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Input placeholder="Service (e.g., plumbing, cleaning)" />
            <Input placeholder="Location" defaultValue="Springfield" />
            <Button
              className="bg-blue-600 hover:bg-blue-700"
              onClick={() => navigate("/dashboard/client/providers")}
            >
              <Search className="h-4 w-4 mr-2" />
              Search Providers
            </Button>
          </div>

          <div className="text-center py-8 bg-blue-50 rounded-lg">
            <Search className="h-16 w-16 text-blue-600 mx-auto mb-4" />
            <p className="text-gray-700 mb-4">
              Ready to find the perfect service provider?
            </p>
            <Button
              className="bg-blue-600 hover:bg-blue-700"
              onClick={() => navigate("/dashboard/client/providers")}
            >
              Browse All Providers
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
