import type { ChangeEvent } from "react";
import { useProviderDashboard } from "../ProviderDashboardContext";
import { Button } from "../../../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../ui/card";
import { Avatar, AvatarFallback } from "../../../ui/avatar";
import { Badge } from "../../../ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../../../ui/dialog";
import { Input } from "../../../ui/input";
import { Label } from "../../../ui/label";
import { Textarea } from "../../../ui/textarea";
import {
  AlertCircle,
  Calendar as CalendarIcon,
  Check,
  Clock,
  DollarSign,
  MapPin,
  Star,
  X,
} from "lucide-react";

export const ProviderRequests = ({
  embedded = false,
}: {
  embedded?: boolean;
}) => {
  const {
    jobRequests,
    handleAcceptRequest,
    handleDeclineRequest,
    setSelectedJobRequest,
    setQuoteDialogOpen,
    quoteDialogOpen,
    selectedJobRequest,
    quoteAmount,
    setQuoteAmount,
    quoteNotes,
    setQuoteNotes,
    handleSubmitQuote,
  } = useProviderDashboard();

  const requestsList = (
    <div className="grid grid-cols-1 gap-4">
      {jobRequests.map((request: any) => (
        <Card key={request.id} className="hover:shadow-lg transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="bg-blue-600 text-white">
                    {request.client
                      .split(" ")
                      .map((n: string) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-bold text-lg text-gray-900">
                    {request.service}
                  </h3>
                  <p className="text-sm text-gray-600">{request.client}</p>
                  <div className="flex items-center gap-1 mt-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-3 w-3 ${star <= Math.floor(request.clientRating) ? "fill-red-500 text-red-500" : "text-gray-300"}`}
                      />
                    ))}
                    <span className="text-xs text-gray-600 ml-1">
                      ({request.clientRating})
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <Badge
                  className={
                    request.urgency === "urgent" ? "bg-red-600" : "bg-blue-600"
                  }
                >
                  {request.urgency === "urgent" ? "Urgent" : "Flexible"}
                </Badge>
                <p className="text-xs text-gray-500 mt-1">
                  {request.postedTime}
                </p>
              </div>
            </div>

            <div className="space-y-2 mb-4 text-sm">
              <p className="text-gray-700">{request.description}</p>
              <div className="grid grid-cols-2 gap-2 pt-2">
                <div className="flex items-center gap-2 text-gray-600">
                  <CalendarIcon className="h-4 w-4" />
                  <span>{request.date}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Clock className="h-4 w-4" />
                  <span>{request.timePreference}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin className="h-4 w-4" />
                  <span className="truncate">{request.address}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <DollarSign className="h-4 w-4" />
                  <span className="font-semibold text-gray-900">
                    ${request.budget}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={() => handleAcceptRequest(request.id)}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                <Check className="h-4 w-4 mr-2" />
                Accept
              </Button>
              <Button
                onClick={() => {
                  setSelectedJobRequest(request);
                  setQuoteDialogOpen(true);
                }}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                Send Quote
              </Button>
              <Button
                onClick={() => handleDeclineRequest(request.id)}
                variant="outline"
                className="text-red-600 border-red-600 hover:bg-red-50"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const quoteDialog = (
    <Dialog open={quoteDialogOpen} onOpenChange={setQuoteDialogOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Send Quote</DialogTitle>
          <DialogDescription>Submit your quote for this job</DialogDescription>
        </DialogHeader>
        {selectedJobRequest && (
          <div className="space-y-4">
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="font-semibold">{selectedJobRequest.service}</p>
              <p className="text-sm text-gray-600">
                Client budget: ${selectedJobRequest.budget}
              </p>
            </div>

            <div>
              <Label htmlFor="quoteAmount">Your Quote Amount ($)</Label>
              <Input
                id="quoteAmount"
                type="number"
                placeholder="Enter amount"
                value={quoteAmount}
                onChange={(event: ChangeEvent<HTMLInputElement>) =>
                  setQuoteAmount(event.target.value)
                }
              />
            </div>

            <div>
              <Label htmlFor="quoteNotes">Additional Notes (Optional)</Label>
              <Textarea
                id="quoteNotes"
                placeholder="Include details about timeline, materials, or any questions..."
                rows={4}
                value={quoteNotes}
                onChange={(event: ChangeEvent<HTMLTextAreaElement>) =>
                  setQuoteNotes(event.target.value)
                }
              />
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleSubmitQuote}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
                disabled={!quoteAmount}
              >
                Send Quote
              </Button>
              <Button
                onClick={() => {
                  setQuoteDialogOpen(false);
                  setQuoteAmount("");
                  setQuoteNotes("");
                }}
                variant="outline"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );

  if (embedded) {
    return (
      <div className="space-y-4">
        {requestsList}
        {quoteDialog}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-600" />
            Pending Job Requests
            <Badge className="bg-red-600 text-white">
              {jobRequests.length}
            </Badge>
          </CardTitle>
          <CardDescription>
            Review and respond to client job requests
          </CardDescription>
        </CardHeader>
        <CardContent>{requestsList}</CardContent>
      </Card>

      {quoteDialog}
    </div>
  );
};
