import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../../components/ui/dialog";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { ArrowLeft, BookOpen, Plus, Calendar, Users, FileText } from "lucide-react";
import { toast } from "sonner";

type User = {
  id: string;
  name: string;
  email: string;
  role: "student" | "staff" | "admin" | "cafeteria";
};

interface AssignmentManagementPageProps {
  user: User;
}

type Assignment = {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  course: string;
  status: "active" | "completed" | "overdue";
  submissions: number;
};

export function AssignmentManagementPage({ user }: AssignmentManagementPageProps) {
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  // Form states
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [course, setCourse] = useState("");

  useEffect(() => {
    // Load assignments from localStorage
    const savedAssignments = localStorage.getItem('staff_assignments');
    if (savedAssignments) {
      setAssignments(JSON.parse(savedAssignments));
    }
  }, []);

  // Save assignments to localStorage whenever assignments change
  useEffect(() => {
    localStorage.setItem('staff_assignments', JSON.stringify(assignments));
  }, [assignments]);

  const handleCreateAssignment = () => {
    if (!title || !description || !dueDate || !course) {
      toast.error("Please fill in all fields");
      return;
    }

    const newAssignment: Assignment = {
      id: Date.now().toString(),
      title,
      description,
      dueDate,
      course,
      status: "active",
      submissions: 0
    };

    setAssignments(prev => [newAssignment, ...prev]);
    toast.success("Assignment created successfully!");

    // Reset form
    setTitle("");
    setDescription("");
    setDueDate("");
    setCourse("");
    setCreateDialogOpen(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-blue-500";
      case "completed": return "bg-green-500";
      case "overdue": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-gradient-primary shadow-card sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20"
                onClick={() => navigate('/staff')}
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">Assignment Management</h1>
                  <p className="text-white/80 text-sm">Create and manage student assignments</p>
                </div>
              </div>
            </div>
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Assignment
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Assignment</DialogTitle>
                  <DialogDescription>
                    Create a new assignment for your students
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title">Assignment Title</Label>
                    <Input
                      id="title"
                      placeholder="Enter assignment title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="course">Course</Label>
                    <Input
                      id="course"
                      placeholder="Enter course name"
                      value={course}
                      onChange={(e) => setCourse(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Enter assignment description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="due-date">Due Date</Label>
                    <Input
                      id="due-date"
                      type="datetime-local"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                    />
                  </div>
                  <Button onClick={handleCreateAssignment} className="w-full">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Assignment
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid gap-6">
          {/* Summary Cards */}
          <div className="grid md:grid-cols-4 gap-6">
            <Card className="shadow-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Assignments</p>
                    <p className="text-3xl font-bold text-primary">{assignments.length}</p>
                  </div>
                  <FileText className="w-8 h-8 text-primary/60" />
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Active Assignments</p>
                    <p className="text-3xl font-bold text-blue-500">
                      {assignments.filter(a => a.status === 'active').length}
                    </p>
                  </div>
                  <BookOpen className="w-8 h-8 text-blue-500/60" />
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Completed</p>
                    <p className="text-3xl font-bold text-green-500">
                      {assignments.filter(a => a.status === 'completed').length}
                    </p>
                  </div>
                  <Calendar className="w-8 h-8 text-green-500/60" />
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Submissions</p>
                    <p className="text-3xl font-bold text-purple-500">
                      {assignments.reduce((sum, a) => sum + a.submissions, 0)}
                    </p>
                  </div>
                  <Users className="w-8 h-8 text-purple-500/60" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Assignments List */}
          <Card className="shadow-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>All Assignments</CardTitle>
                  <CardDescription>Manage your course assignments</CardDescription>
                </div>
                <Button onClick={() => setCreateDialogOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Assignment
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {assignments.length === 0 ? (
                <div className="text-center py-12">
                  <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-muted-foreground mb-2">No assignments yet</h3>
                  <p className="text-sm text-muted-foreground mb-6">
                    Create your first assignment to get started with managing student work
                  </p>
                  <Button onClick={() => setCreateDialogOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Your First Assignment
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {assignments.map((assignment) => (
                    <div
                      key={assignment.id}
                      className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-medium">{assignment.title}</h4>
                          <Badge className={`${getStatusColor(assignment.status)} text-white`}>
                            {assignment.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{assignment.description}</p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>{assignment.course}</span>
                          <span>Due: {new Date(assignment.dueDate).toLocaleDateString()}</span>
                          <span>{assignment.submissions} submissions</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          View Submissions
                        </Button>
                        <Button variant="outline" size="sm">
                          Edit
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}