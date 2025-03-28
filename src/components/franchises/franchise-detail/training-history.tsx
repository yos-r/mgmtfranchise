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
      if (!franchise?.id) return;
      
      setLoading(true);
      
      try {
        // First, get all training events
        const { data: eventsData, error: eventsError } = await supabase
          .from('training_events')
          .select('*')
          .order('date', { ascending: false });
        
        if (eventsError) throw eventsError;
        
        // Then, get attendance records for this franchise
        const { data: attendanceData, error: attendanceError } = await supabase
          .from('training_attendance')
          .select('*')
          .eq('franchise_id', franchise.id);
        
        if (attendanceError) throw attendanceError;
        
        // Map attendance data to events
        const trainingWithAttendance = eventsData.map(event => {
          const attendanceRecord = attendanceData.find(a => a.event_id === event.id);
          return {
            ...event,
            attended: attendanceRecord ? attendanceRecord.attended : false,
            // If no attendance record exists, the franchise didn't attend
            attendanceId: attendanceRecord ? attendanceRecord.id : null
          };
        });
        
        setTrainings(trainingWithAttendance);
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
                    {format(new Date(training.date), "MMM d, yyyy")}
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