import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Textarea } from "../ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { CheckCircle, XCircle, Eye, FileText, Clock, User, BookOpen, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { api } from "../../api";

type User = {
  id: string;
  name: string;
  email: string;
  role: "student" | "staff" | "admin";
};

interface GradeApprovalProps {
  user: User;
}

type GradeSheet = {
  _id: string;
  course: {
    name: string;
    code: string;
  };
  instructor: {
    name: string;
  };
  assessmentType: string;
  assessmentName: string;
  grades: Array<{
    student: string;
    grade: string;
    comments?: string;
  }>;
  status: string;
  submittedAt: string;
  weightage: number;
};

export function GradeApproval({ user }: GradeApprovalProps) {
  const [pendingGrades, setPendingGrades] = useState<GradeSheet[]>([]);
  const [selectedGrade, setSelectedGrade] = useState<GradeSheet | null>(null);
  const [reviewDialog, setReviewDialog] = useState(false);
  const [action, setAction] = useState<'approve' | 'reject'>('approve');
  const [comments, setComments] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadPendingGrades();
  }, []);

  const loadPendingGrades = async () => {
    try {
      const data = await api.getPendingGrades();
      // Ensure data is an array and filter out any invalid entries
      const validData = Array.isArray(data) ? data.filter(grade =>
        grade && grade._id && grade.course && grade.instructor
      ) : [];
      setPendingGrades(validData);
    } catch (error) {
      toast.error("Failed to load pending grades");
      setPendingGrades([]); // Set empty array on error
    }
  };

  const handleReview = (grade: GradeSheet, actionType: 'approve' | 'reject') => {
    setSelectedGrade(grade);
    setAction(actionType);
    setComments('');
    setReviewDialog(true);
  };

  const submitReview = async () => {
    if (!selectedGrade) return;

    setLoading(true);
    try {
      if (action === 'approve') {
        await api.approveGradeSheet(selectedGrade._id, comments);
        toast.success("Grade sheet approved successfully");
      } else {
        if (!comments.trim()) {
          toast.error("Please provide a reason for rejection");
          setLoading(false);
          return;
        }
        await api.rejectGradeSheet(selectedGrade._id, comments);
        toast.success("Grade sheet rejected");
      }

      setReviewDialog(false);
      setSelectedGrade(null);
      loadPendingGrades();
    } catch (error) {
      toast.error(`Failed to ${action} grade sheet`);
    } finally {
      setLoading(false);
    }
  };

  const publishGrade = async (gradeId: string) => {
    try {
      await api.publishGradeSheet(gradeId);
      toast.success("Grade sheet published to students");
      loadPendingGrades();
    } catch (error) {
      toast.error("Failed to publish grade sheet");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "submitted": return "bg-yellow-500";
      case "approved": return "bg-green-500";
      case "rejected": return "bg-red-500";
      case "published": return "bg-blue-500";
      default: return "bg-secondary";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Grade Approval Workflow
          </CardTitle>
          <CardDescription>
            Review and approve grade submissions from instructors
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending Review</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {pendingGrades.filter(g => g.status === 'submitted').length}
                </p>
              </div>
              <Clock className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Approved Today</p>
                <p className="text-2xl font-bold text-green-600">
                  {pendingGrades.filter(g => g.status === 'approved' &&
                    new Date(g.submittedAt).toDateString() === new Date().toDateString()).length}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Rejected</p>
                <p className="text-2xl font-bold text-red-600">
                  {pendingGrades.filter(g => g.status === 'rejected').length}
                </p>
              </div>
              <XCircle className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Published</p>
                <p className="text-2xl font-bold text-blue-600">
                  {pendingGrades.filter(g => g.status === 'published').length}
                </p>
              </div>
              <BookOpen className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Grades Table */}
      <Card>
        <CardHeader>
          <CardTitle>Pending Grade Submissions</CardTitle>
          <CardDescription>
            Review grade sheets submitted by instructors
          </CardDescription>
        </CardHeader>
        <CardContent>
          {pendingGrades.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No pending grade submissions
            </div>
          ) : (
            <div className="space-y-4">
              {pendingGrades.map((grade) => (
                <div key={grade._id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <FileText className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-medium">{grade.assessmentName}</h3>
                        <p className="text-sm text-muted-foreground">
                          {grade.course?.name || 'Unknown Course'} ({grade.course?.code || 'N/A'}) • {grade.instructor?.name || 'Unknown Instructor'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(grade.status)}>
                        {grade.status}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {grade.grades.length} students
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
                    <span>Type: {grade.assessmentType}</span>
                    <span>Weightage: {grade.weightage}%</span>
                    <span>Submitted: {new Date(grade.submittedAt).toLocaleDateString()}</span>
                  </div>

                  <div className="flex gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>{grade.assessmentName}</DialogTitle>
                          <DialogDescription>
                            {grade.course?.name || 'Unknown Course'} - Submitted by {grade.instructor?.name || 'Unknown Instructor'}
                          </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4">
                          <div className="grid grid-cols-3 gap-4 text-sm">
                            <div>
                              <strong>Assessment Type:</strong> {grade.assessmentType}
                            </div>
                            <div>
                              <strong>Weightage:</strong> {grade.weightage}%
                            </div>
                            <div>
                              <strong>Students:</strong> {grade.grades.length}
                            </div>
                          </div>

                          <div className="border rounded">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Student ID</TableHead>
                                  <TableHead>Grade</TableHead>
                                  <TableHead>Comments</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {grade.grades.map((gradeEntry, index) => (
                                  <TableRow key={index}>
                                    <TableCell className="font-mono text-sm">
                                      {gradeEntry.student.slice(-8)}
                                    </TableCell>
                                    <TableCell className="font-medium">{gradeEntry.grade}</TableCell>
                                    <TableCell>{gradeEntry.comments || '-'}</TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>

                    {grade.status === 'submitted' && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => handleReview(grade, 'approve')}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleReview(grade, 'reject')}
                          className="border-red-300 text-red-700 hover:bg-red-50"
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          Reject
                        </Button>
                      </>
                    )}

                    {grade.status === 'approved' && (
                      <Button
                        size="sm"
                        onClick={() => publishGrade(grade._id)}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <BookOpen className="w-4 h-4 mr-2" />
                        Publish
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Review Dialog */}
      <Dialog open={reviewDialog} onOpenChange={setReviewDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {action === 'approve' ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <XCircle className="w-5 h-5 text-red-600" />
              )}
              {action === 'approve' ? 'Approve' : 'Reject'} Grade Sheet
            </DialogTitle>
            <DialogDescription>
              {selectedGrade && `${selectedGrade.assessmentName} - ${selectedGrade.course?.name || 'Unknown Course'}`}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {action === 'reject' && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Reason for Rejection *</label>
                <Textarea
                  placeholder="Please provide a reason for rejecting this grade sheet..."
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  rows={3}
                />
              </div>
            )}

            {action === 'approve' && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Approval Comments (Optional)</label>
                <Textarea
                  placeholder="Add any comments for the instructor..."
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  rows={3}
                />
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setReviewDialog(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={submitReview}
                disabled={loading || (action === 'reject' && !comments.trim())}
                className={action === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
              >
                {loading ? 'Processing...' : (action === 'approve' ? 'Approve' : 'Reject')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}