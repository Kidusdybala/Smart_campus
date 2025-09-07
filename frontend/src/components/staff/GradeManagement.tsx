import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Textarea } from "../ui/textarea";
import { Badge } from "../ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Upload, FileText, BookOpen, Users, CheckCircle, Clock, AlertCircle, Plus } from "lucide-react";
import { toast } from "sonner";
import { api } from "../../api";

type User = {
  id: string;
  name: string;
  email: string;
  role: "student" | "staff" | "admin";
};

interface GradeManagementProps {
  user: User;
}

type Course = {
  _id: string;
  name: string;
  code: string;
  semester: string;
  year: number;
  department: string;
};

type Enrollment = {
  _id: string;
  student: {
    _id: string;
    name: string;
    email: string;
  };
};

type GradeEntry = {
  student: string;
  enrollment: string;
  grade: string;
  comments?: string;
};

type GradeSheet = {
  _id: string;
  course: {
    name: string;
    code: string;
  };
  assessmentType: string;
  assessmentName: string;
  weightage: number;
  status: string;
  createdAt: string;
  rejectionReason?: string;
};

export function GradeManagement({ user }: GradeManagementProps) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [gradeSheets, setGradeSheets] = useState<GradeSheet[]>([]);
  const [loading, setLoading] = useState(false);

  // Form states
  const [assessmentType, setAssessmentType] = useState<string>("");
  const [assessmentName, setAssessmentName] = useState<string>("");
  const [totalMarks, setTotalMarks] = useState<string>("");
  const [weightage, setWeightage] = useState<string>("");
  const [grades, setGrades] = useState<{[key: string]: GradeEntry}>({});
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  useEffect(() => {
    loadInstructorData();
  }, []);

  const loadInstructorData = async () => {
    try {
      setLoading(true);
      const [coursesData, gradesData] = await Promise.all([
        api.getInstructorCourses(),
        api.getInstructorGrades()
      ]);
      setCourses(coursesData);
      setGradeSheets(gradesData);
    } catch (error) {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const loadCourseEnrollments = async (courseId: string) => {
    try {
      const enrollmentsData = await api.getCourseEnrollments(courseId);
      setEnrollments(enrollmentsData);

      // Initialize grades object
      const initialGrades: {[key: string]: GradeEntry} = {};
      enrollmentsData.forEach((enrollment: Enrollment) => {
        initialGrades[enrollment.student._id] = {
          student: enrollment.student._id,
          enrollment: enrollment._id,
          grade: "",
          comments: ""
        };
      });
      setGrades(initialGrades);
    } catch (error) {
      toast.error("Failed to load enrollments");
    }
  };

  const handleCourseChange = (courseId: string) => {
    setSelectedCourse(courseId);
    if (courseId) {
      loadCourseEnrollments(courseId);
    } else {
      setEnrollments([]);
      setGrades({});
    }
  };

  const handleGradeChange = (studentId: string, field: string, value: string) => {
    setGrades(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [field]: value
      }
    }));
  };

  const handleCsvUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setCsvFile(file);
      parseCsvFile(file);
    }
  };

  const parseCsvFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const csv = e.target?.result as string;
        const lines = csv.split('\n').filter(line => line.trim());
        const headers = lines[0].split(',').map(h => h.trim().toLowerCase());

        // Expected format: student_id, grade, comments
        const studentIdIndex = headers.findIndex(h => h.includes('student') || h.includes('id'));
        const gradeIndex = headers.findIndex(h => h.includes('grade'));
        const commentsIndex = headers.findIndex(h => h.includes('comment'));

        if (studentIdIndex === -1 || gradeIndex === -1) {
          toast.error("CSV must contain 'student_id' and 'grade' columns");
          return;
        }

        const parsedGrades: {[key: string]: GradeEntry} = {};

        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(',').map(v => v.trim());
          const studentId = values[studentIdIndex];
          const grade = values[gradeIndex]?.toUpperCase();
          const comments = commentsIndex !== -1 ? values[commentsIndex] : '';

          if (studentId && grade) {
            // Find the enrollment for this student
            const enrollment = enrollments.find(e => e.student._id === studentId);
            if (enrollment) {
              parsedGrades[studentId] = {
                student: studentId,
                enrollment: enrollment._id,
                grade: grade,
                comments: comments
              };
            }
          }
        }

        setGrades(parsedGrades);
        toast.success(`Parsed ${Object.keys(parsedGrades).length} grades from CSV`);
      } catch (error) {
        toast.error("Failed to parse CSV file");
        console.error("CSV parsing error:", error);
      }
    };
    reader.readAsText(file);
  };

  const createGradeSheet = async () => {
    if (!selectedCourse || !assessmentType || !assessmentName || !totalMarks || !weightage) {
      toast.error("Please fill in all required fields");
      return;
    }

    const gradeEntries = Object.values(grades).filter(g => g.grade);

    if (gradeEntries.length === 0) {
      toast.error("Please enter at least one grade");
      return;
    }

    try {
      setLoading(true);
      const gradeData = {
        assessmentType,
        assessmentName,
        totalMarks: parseInt(totalMarks),
        weightage: parseInt(weightage),
        grades: gradeEntries
      };

      await api.createGradeSheet(selectedCourse, gradeData);
      toast.success("Grade sheet created successfully");

      // Reset form
      setAssessmentType("");
      setAssessmentName("");
      setTotalMarks("");
      setWeightage("");
      setGrades({});
      setCreateDialogOpen(false);

      // Reload data
      loadInstructorData();
    } catch (error) {
      toast.error("Failed to create grade sheet");
    } finally {
      setLoading(false);
    }
  };

  const submitGradeSheet = async (gradeId: string) => {
    try {
      await api.submitGradeSheet(gradeId);
      toast.success("Grade sheet submitted for approval");
      loadInstructorData();
    } catch (error) {
      toast.error("Failed to submit grade sheet");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "draft": return "bg-gray-500";
      case "submitted": return "bg-yellow-500";
      case "approved": return "bg-green-500";
      case "rejected": return "bg-red-500";
      case "published": return "bg-blue-500";
      default: return "bg-secondary";
    }
  };

  const downloadCsvTemplate = () => {
    if (enrollments.length === 0) {
      toast.error("Please select a course first to generate template");
      return;
    }

    const csvContent = [
      "student_id,grade,comments",
      ...enrollments.map(enrollment => `${enrollment.student._id},,`)
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${selectedCourse}_grades_template.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    toast.success("CSV template downloaded");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            Grade Management
          </CardTitle>
          <CardDescription>
            Upload and manage student grades for your courses
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="create" className="space-y-6">
        <TabsList>
          <TabsTrigger value="create" className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Create Grades
          </TabsTrigger>
          <TabsTrigger value="manage" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Manage Submissions
          </TabsTrigger>
        </TabsList>

        {/* Create Grades Tab */}
        <TabsContent value="create" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Create New Grade Sheet</CardTitle>
              <CardDescription>
                Select a course and enter grades for enrolled students
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="course">Select Course *</Label>
                  <Select value={selectedCourse} onValueChange={handleCourseChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a course" />
                    </SelectTrigger>
                    <SelectContent>
                      {courses.map((course) => (
                        <SelectItem key={course._id} value={course._id}>
                          {course.code} - {course.name} ({course.semester} {course.year})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="assessmentType">Assessment Type *</Label>
                  <Select value={assessmentType} onValueChange={setAssessmentType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="midterm">Midterm Exam</SelectItem>
                      <SelectItem value="final">Final Exam</SelectItem>
                      <SelectItem value="assignment">Assignment</SelectItem>
                      <SelectItem value="project">Project</SelectItem>
                      <SelectItem value="quiz">Quiz</SelectItem>
                      <SelectItem value="lab">Lab Work</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="assessmentName">Assessment Name *</Label>
                  <Input
                    id="assessmentName"
                    placeholder="e.g., Midterm Exam 1"
                    value={assessmentName}
                    onChange={(e) => setAssessmentName(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="totalMarks">Total Marks *</Label>
                  <Input
                    id="totalMarks"
                    type="number"
                    placeholder="100"
                    value={totalMarks}
                    onChange={(e) => setTotalMarks(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="weightage">Weightage (%) *</Label>
                  <Input
                    id="weightage"
                    type="number"
                    placeholder="30"
                    value={weightage}
                    onChange={(e) => setWeightage(e.target.value)}
                  />
                </div>
              </div>

              {selectedCourse && enrollments.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">Enter Grades</h3>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={downloadCsvTemplate}
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        Download Template
                      </Button>
                      <Button variant="outline" size="sm">
                        <Upload className="w-4 h-4 mr-2" />
                        Upload CSV
                        <input
                          type="file"
                          accept=".csv"
                          onChange={handleCsvUpload}
                          className="hidden"
                        />
                      </Button>
                    </div>
                  </div>

                  <div className="border rounded-lg">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Student Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Grade</TableHead>
                          <TableHead>Comments</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {enrollments.map((enrollment) => (
                          <TableRow key={enrollment._id}>
                            <TableCell className="font-medium">
                              {enrollment.student.name}
                            </TableCell>
                            <TableCell>{enrollment.student.email}</TableCell>
                            <TableCell>
                              <Input
                                placeholder="A/A-/B+/B/B-/C+/C/C-/D+/D/D-/F"
                                value={grades[enrollment.student._id]?.grade || ""}
                                onChange={(e) => handleGradeChange(enrollment.student._id, 'grade', e.target.value.toUpperCase())}
                                className="w-24"
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                placeholder="Optional comments"
                                value={grades[enrollment.student._id]?.comments || ""}
                                onChange={(e) => handleGradeChange(enrollment.student._id, 'comments', e.target.value)}
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  <Button onClick={createGradeSheet} disabled={loading} className="w-full">
                    <FileText className="w-4 h-4 mr-2" />
                    {loading ? "Creating..." : "Create Grade Sheet"}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Manage Submissions Tab */}
        <TabsContent value="manage" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Grade Sheet Submissions</CardTitle>
              <CardDescription>
                Track the status of your grade submissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {gradeSheets.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No grade sheets created yet
                </div>
              ) : (
                <div className="space-y-4">
                  {gradeSheets.map((sheet) => (
                    <div key={sheet._id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h3 className="font-medium">{sheet.assessmentName}</h3>
                          <p className="text-sm text-muted-foreground">
                            {sheet.course?.name} - {sheet.assessmentType}
                          </p>
                        </div>
                        <Badge className={getStatusColor(sheet.status)}>
                          {sheet.status}
                        </Badge>
                      </div>

                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>Weightage: {sheet.weightage}%</span>
                        <span>Created: {new Date(sheet.createdAt).toLocaleDateString()}</span>
                      </div>

                      {sheet.status === 'draft' && (
                        <Button
                          size="sm"
                          onClick={() => submitGradeSheet(sheet._id)}
                          className="mt-3"
                        >
                          Submit for Approval
                        </Button>
                      )}

                      {sheet.status === 'rejected' && (
                        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded">
                          <p className="text-sm text-red-700">
                            <strong>Rejected:</strong> {sheet.rejectionReason}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}