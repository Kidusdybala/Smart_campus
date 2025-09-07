import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { BookOpen, GraduationCap, TrendingUp, Calendar, Award, Target } from "lucide-react";
import { api } from "../../api";

type User = {
  id: string;
  name: string;
  email: string;
  role: "student" | "staff" | "admin";
};

interface StudentGradesProps {
  user: User;
}

type CourseGrade = {
  course: {
    name: string;
    code: string;
  };
  enrollment: {
    semester: string;
    year: number;
    grade?: string;
    gradePoints?: number;
  };
  grades: Array<{
    assessmentType: string;
    assessmentName: string;
    grade: string;
    weightage: number;
    submittedAt: string;
  }>;
  finalGrade?: string;
  gradePoints?: number;
};

type StudentCourse = {
  course: {
    name: string;
    code: string;
    instructor?: {
      name: string;
    };
    credits: number;
  };
  semester: string;
  year: number;
  status: string;
  grade?: string;
};

export function StudentGrades({ user }: StudentGradesProps) {
  const [grades, setGrades] = useState<CourseGrade[]>([]);
  const [courses, setCourses] = useState<StudentCourse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStudentData();
  }, []);

  const loadStudentData = async () => {
    try {
      setLoading(true);
      const [gradesData, coursesData] = await Promise.all([
        api.getStudentGrades(),
        api.getStudentCourses()
      ]);
      setGrades(gradesData);
      setCourses(coursesData);
    } catch (error) {
      console.error("Failed to load student data:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateGPA = () => {
    if (grades.length === 0) return 0;

    const gradedCourses = grades.filter(g => g.finalGrade && g.gradePoints);
    if (gradedCourses.length === 0) return 0;

    const totalPoints = gradedCourses.reduce((sum, course) => sum + (course.gradePoints || 0), 0);
    return (totalPoints / gradedCourses.length).toFixed(2);
  };

  const getGradeColor = (grade: string) => {
    const colors = {
      'A': 'bg-green-500',
      'B': 'bg-blue-500',
      'C': 'bg-yellow-500',
      'D': 'bg-orange-500',
      'F': 'bg-red-500'
    };
    return colors[grade as keyof typeof colors] || 'bg-gray-500';
  };

  const getGradeProgress = (grade: string) => {
    const progress = {
      'A': 100,
      'B': 80,
      'C': 60,
      'D': 40,
      'F': 20
    };
    return progress[grade as keyof typeof progress] || 0;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p>Loading your grades...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5" />
            Academic Performance
          </CardTitle>
          <CardDescription>
            View your grades and academic progress
          </CardDescription>
        </CardHeader>
      </Card>

      {/* GPA Overview */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Current GPA</p>
                <p className="text-3xl font-bold text-primary">{calculateGPA()}</p>
              </div>
              <Award className="w-8 h-8 text-primary/60" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Courses Completed</p>
                <p className="text-3xl font-bold text-success">
                  {grades.filter(g => g.finalGrade).length}
                </p>
              </div>
              <BookOpen className="w-8 h-8 text-success/60" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Courses</p>
                <p className="text-3xl font-bold text-warning">{courses.length}</p>
              </div>
              <Target className="w-8 h-8 text-warning/60" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="grades" className="space-y-6">
        <TabsList>
          <TabsTrigger value="grades" className="flex items-center gap-2">
            <Award className="w-4 h-4" />
            My Grades
          </TabsTrigger>
          <TabsTrigger value="courses" className="flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            Course Overview
          </TabsTrigger>
        </TabsList>

        {/* Grades Tab */}
        <TabsContent value="grades" className="space-y-6">
          {grades.length === 0 ? (
            <Card>
              <CardContent className="p-8">
                <div className="text-center text-muted-foreground">
                  <GraduationCap className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No grades available yet</p>
                  <p className="text-sm">Grades will appear here once they are published by your instructors</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {grades.map((courseGrade, index) => (
                <Card key={index} className="shadow-card">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">
                          {courseGrade.course.name}
                        </CardTitle>
                        <CardDescription>
                          {courseGrade.course.code} • {courseGrade.enrollment.semester} {courseGrade.enrollment.year}
                        </CardDescription>
                      </div>
                      {courseGrade.finalGrade && (
                        <div className="text-right">
                          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-white text-sm font-medium ${getGradeColor(courseGrade.finalGrade)}`}>
                            <Award className="w-4 h-4" />
                            {courseGrade.finalGrade}
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {courseGrade.gradePoints} GPA points
                          </p>
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    {courseGrade.grades.length > 0 ? (
                      <div className="space-y-4">
                        <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                          Assessment Breakdown
                        </h4>
                        <div className="space-y-3">
                          {courseGrade.grades.map((assessment, idx) => (
                            <div key={idx} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">{assessment.assessmentName}</span>
                                  <Badge variant="outline" className="text-xs">
                                    {assessment.assessmentType}
                                  </Badge>
                                </div>
                                <div className="text-sm text-muted-foreground mt-1">
                                  Weightage: {assessment.weightage}% • Submitted: {new Date(assessment.submittedAt).toLocaleDateString()}
                                </div>
                              </div>
                              <div className="text-right">
                                <div className={`inline-flex items-center gap-2 px-2 py-1 rounded text-white text-sm font-medium ${getGradeColor(assessment.grade)}`}>
                                  {assessment.grade}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Grade Progress Visualization */}
                        {courseGrade.finalGrade && (
                          <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-blue-800">Grade Performance</span>
                              <span className="text-sm text-blue-600">{courseGrade.finalGrade}</span>
                            </div>
                            <Progress
                              value={getGradeProgress(courseGrade.finalGrade)}
                              className="h-2"
                            />
                            <div className="flex justify-between text-xs text-blue-600 mt-1">
                              <span>F</span>
                              <span>D</span>
                              <span>C</span>
                              <span>B</span>
                              <span>A</span>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p>No assessments graded yet</p>
                        <p className="text-sm">Grades will be published here as they become available</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Courses Tab */}
        <TabsContent value="courses" className="space-y-6">
          {courses.length === 0 ? (
            <Card>
              <CardContent className="p-8">
                <div className="text-center text-muted-foreground">
                  <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No active courses</p>
                  <p className="text-sm">You are not enrolled in any courses this semester</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {courses.map((enrollment, index) => (
                <Card key={index} className="shadow-card">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{enrollment.course.name}</h3>
                        <p className="text-muted-foreground">{enrollment.course.code}</p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                          <span>Instructor: {enrollment.course.instructor?.name || 'TBA'}</span>
                          <span>Credits: {enrollment.course.credits}</span>
                          <span>Semester: {enrollment.semester} {enrollment.year}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="secondary" className="mb-2">
                          {enrollment.status}
                        </Badge>
                        {enrollment.grade && (
                          <div className="text-sm">
                            <span className="font-medium">Grade: </span>
                            <span className={`font-bold ${getGradeColor(enrollment.grade).replace('bg-', 'text-').replace('-500', '-600')}`}>
                              {enrollment.grade}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}