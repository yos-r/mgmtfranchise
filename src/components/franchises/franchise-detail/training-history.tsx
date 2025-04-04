import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/auth";

export function TrainingHistory({ franchise }) {
  const [trainings, setTrainings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrainingData = async () => {
      if (!franchise?.id) {
        setLoading(false);
        return;
      }
      
      setLoading(true);
      
      try {
        // First, get the attendance records for this franchise
        const { data: attendanceData, error: attendanceError } = await supabase
          .from('training_attendance')
          .select('*, training_events(*)')
          .eq('franchise_id', franchise.id);
        
        if (attendanceError) throw attendanceError;
        
        // Map the joined data to our desired format
        const trainingHistory = attendanceData.map(record => {
          return {
            id: record.training_events.id,
            title: record.training_events.title,
            type: record.training_events.type,
            date: record.training_events.date,
            duration: record.training_events.duration,
            trainer: record.training_events.trainer,
            attended: record.attended,
            attendanceId: record.id
          };
        });
        
        // Sort by date (newest first)
        trainingHistory.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        setTrainings(trainingHistory);
      } catch (error) {
        console.error('Error fetching training data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchTrainingData();
  }, [franchise?.id]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="tagline-2">Training Attendance History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-4 text-center">Loading training history...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="tagline-2">Training Attendance History</CardTitle>
      </CardHeader>
      <CardContent>
        {trainings.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground">No training history available.</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="label-1">Training</TableHead>
                <TableHead className="label-1">Type</TableHead>
                <TableHead className="label-1">Date</TableHead>
                <TableHead className="label-1">Duration</TableHead>
                <TableHead className="label-1">Trainer</TableHead>
                <TableHead className="label-1">Attendance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {trainings.map((training) => (
                <TableRow key={training.id}>
                  <TableCell className="body-1 font-medium">
                    {training.title}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="label-2">
                      {training.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="body-1">
                    {format(new Date(training.date), "dd/MM/yyyy")}
                  </TableCell>
                  <TableCell className="body-1">{training.duration}</TableCell>
                  <TableCell className="body-1">{training.trainer}</TableCell>
                  <TableCell>
                    <Badge className={training.attended ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                      {training.attended ? "Yes" : "No"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}