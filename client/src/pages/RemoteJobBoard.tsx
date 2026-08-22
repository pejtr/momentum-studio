import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { getSafeExternalUrl } from "@/lib/safeExternalUrl";
import { TagManager, JobTag, getTagColorClass } from "@/components/TagManager";
import {
  Search,
  MapPin,
  DollarSign,
  Briefcase,
  Building2,
  Calendar,
  ExternalLink,
  Bookmark,
  BookmarkCheck,
  Send,
  MessageSquare,
  CheckCircle2,
  XCircle,
  Clock,
  Filter,
  TrendingUp,
  Tag as TagIcon,
} from "lucide-react";


export default function RemoteJobBoard() {

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [salaryMin, setSalaryMin] = useState("");
  const [salaryMax, setSalaryMax] = useState("");
  const [location, setLocation] = useState("all");
  const [postedWithin, setPostedWithin] = useState("30");
  const [jobType, setJobType] = useState("all");
  const [companySize, setCompanySize] = useState("all");
  const [activeTab, setActiveTab] = useState("all");
  const [selectedTagFilter, setSelectedTagFilter] = useState<number | null>(null);

  // Tags state
  const [userTags, setUserTags] = useState<JobTag[]>([
    { id: 1, name: "High Priority", color: "red", userId: 1, createdAt: new Date() },
    { id: 2, name: "Remote Only", color: "blue", userId: 1, createdAt: new Date() },
    { id: 3, name: "Good Benefits", color: "green", userId: 1, createdAt: new Date() },
  ]);

  // Job tags mapping (jobId -> tagIds[])
  const [jobTagsMap, setJobTagsMap] = useState<Record<number, number[]>>({
    1: [1, 2], // Senior QA Engineer has "High Priority" and "Remote Only"
    2: [3], // QA Lead has "Good Benefits"
  });

  // Mock job listings (in production, this would come from trpc.jobs.list.useQuery)
  const mockJobs = [
    {
      id: 1,
      title: "Senior QA Automation Engineer",
      company: "TechCorp Inc.",
      location: "Remote - Worldwide",
      salaryMin: 80000,
      salaryMax: 120000,
      jobType: "Full-time",
      skills: ["Cypress", "Playwright", "TypeScript", "CI/CD"],
      description: "We're looking for an experienced QA automation engineer to join our growing team...",
      requirements: ["5+ years QA experience", "Strong Cypress/Playwright skills", "CI/CD expertise"],
      companySize: "Mid-size",
      applyUrl: "https://example.com/apply",
      postedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      source: "LinkedIn",
      createdAt: new Date(),
    },
    {
      id: 2,
      title: "QA Test Automation Lead",
      company: "Global Solutions Ltd.",
      location: "Remote - Europe",
      salaryMin: 90000,
      salaryMax: 140000,
      jobType: "Full-time",
      skills: ["Selenium", "Java", "REST API", "SOAP"],
      description: "Lead our QA automation efforts and mentor junior engineers...",
      requirements: ["7+ years experience", "Team leadership", "API testing expertise"],
      companySize: "Enterprise",
      applyUrl: "https://example.com/apply",
      postedDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      source: "Indeed",
      createdAt: new Date(),
    },
    {
      id: 3,
      title: "Junior QA Engineer",
      company: "StartupXYZ",
      location: "Remote - USA",
      salaryMin: 50000,
      salaryMax: 70000,
      jobType: "Full-time",
      skills: ["Cypress", "JavaScript", "Manual Testing"],
      description: "Join our startup and grow your QA automation skills...",
      requirements: ["1-2 years experience", "Basic automation knowledge", "Eager to learn"],
      companySize: "Startup",
      applyUrl: "https://example.com/apply",
      postedDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      source: "Remote.co",
      createdAt: new Date(),
    },
  ];

  const [applications, setApplications] = useState<Record<number, {
    status: string;
    notes: string;
    appliedDate?: Date;
    interviewDate?: Date;
  }>>({});

  const skillOptions = [
    "Cypress",
    "Playwright",
    "Selenium",
    "SOAP",
    "REST API",
    "TypeScript",
    "JavaScript",
    "Java",
    "Python",
    "CI/CD",
    "Docker",
    "Kubernetes",
  ];

  const toggleSkill = (skill: string) => {
    setSelectedSkills(prev =>
      prev.includes(skill)
        ? prev.filter(s => s !== skill)
        : [...prev, skill]
    );
  };

  const formatSalary = (min: number, max: number) => {
    return `$${(min / 1000).toFixed(0)}k - $${(max / 1000).toFixed(0)}k`;
  };

  const formatPostedDate = (date: Date) => {
    const days = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    return `${days} days ago`;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "saved":
        return <Bookmark className="h-4 w-4" />;
      case "applied":
        return <Send className="h-4 w-4" />;
      case "interview":
        return <MessageSquare className="h-4 w-4" />;
      case "offer":
        return <CheckCircle2 className="h-4 w-4" />;
      case "rejected":
        return <XCircle className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "saved":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "applied":
        return "bg-purple-500/10 text-purple-500 border-purple-500/20";
      case "interview":
        return "bg-amber-500/10 text-amber-500 border-amber-500/20";
      case "offer":
        return "bg-green-500/10 text-green-500 border-green-500/20";
      case "rejected":
        return "bg-red-500/10 text-red-500 border-red-500/20";
      default:
        return "";
    }
  };

  const updateApplicationStatus = (jobId: number, status: string) => {
    setApplications(prev => ({
      ...prev,
      [jobId]: {
        ...prev[jobId],
        status,
        appliedDate: status === "applied" ? new Date() : prev[jobId]?.appliedDate,
        interviewDate: status === "interview" ? new Date() : prev[jobId]?.interviewDate,
        notes: prev[jobId]?.notes || "",
      },
    }));

    // Status updated successfully
  };

  const filteredJobs = mockJobs.filter(job => {
    // Search query filter
    if (searchQuery && !job.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !job.company.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }

    // Skills filter
    if (selectedSkills.length > 0) {
      const hasMatchingSkill = selectedSkills.some(skill =>
        job.skills.some(jobSkill => jobSkill.toLowerCase().includes(skill.toLowerCase()))
      );
      if (!hasMatchingSkill) return false;
    }

    // Salary filter
    if (salaryMin && job.salaryMax < parseInt(salaryMin)) return false;
    if (salaryMax && job.salaryMin > parseInt(salaryMax)) return false;

    // Location filter
    if (location !== "all" && !job.location.toLowerCase().includes(location.toLowerCase())) {
      return false;
    }

    // Posted date filter
    const daysSincePosted = Math.floor((Date.now() - job.postedDate.getTime()) / (1000 * 60 * 60 * 24));
    if (postedWithin !== "all" && daysSincePosted > parseInt(postedWithin)) {
      return false;
    }

    // Job type filter
    if (jobType !== "all" && job.jobType !== jobType) return false;

    // Company size filter
    if (companySize !== "all" && job.companySize !== companySize) return false;

    // Tab filter
    if (activeTab !== "all") {
      const appStatus = applications[job.id]?.status;
      if (activeTab === "saved" && appStatus !== "saved") return false;
      if (activeTab === "applied" && appStatus !== "applied") return false;
      if (activeTab === "interview" && appStatus !== "interview") return false;
    }

    // Tag filter
    if (selectedTagFilter !== null) {
      const jobTags = jobTagsMap[job.id] || [];
      if (!jobTags.includes(selectedTagFilter)) return false;
    }

    return true;
  });

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Remote QA Job Board</h1>
          <p className="text-muted-foreground">
            Find your next remote QA automation role with advanced filters and application tracking
          </p>
        </div>
        <TagManager
          tags={userTags}
          onCreateTag={(name, color) => {
            const newTag: JobTag = {
              id: Math.max(0, ...userTags.map(t => t.id)) + 1,
              name,
              color,
              userId: 1,
              createdAt: new Date(),
            };
            setUserTags([...userTags, newTag]);
          }}
          onDeleteTag={(tagId) => {
            setUserTags(userTags.filter(t => t.id !== tagId));
            // Remove tag from all jobs
            const newJobTagsMap = { ...jobTagsMap };
            Object.keys(newJobTagsMap).forEach(jobId => {
              newJobTagsMap[parseInt(jobId)] = newJobTagsMap[parseInt(jobId)].filter(id => id !== tagId);
            });
            setJobTagsMap(newJobTagsMap);
            // Clear filter if deleted tag was selected
            if (selectedTagFilter === tagId) {
              setSelectedTagFilter(null);
            }
          }}
          onUpdateTag={(tagId, name, color) => {
            setUserTags(userTags.map(t => t.id === tagId ? { ...t, name, color } : t));
          }}
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="glass-card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Briefcase className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Jobs</p>
              <p className="text-2xl font-bold">{mockJobs.length}</p>
            </div>
          </div>
        </Card>

        <Card className="glass-card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10">
              <BookmarkCheck className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Saved</p>
              <p className="text-2xl font-bold">
                {Object.values(applications).filter(a => a.status === "saved").length}
              </p>
            </div>
          </div>
        </Card>

        <Card className="glass-card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-500/10">
              <Send className="h-5 w-5 text-purple-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Applied</p>
              <p className="text-2xl font-bold">
                {Object.values(applications).filter(a => a.status === "applied").length}
              </p>
            </div>
          </div>
        </Card>

        <Card className="glass-card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10">
              <MessageSquare className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Interviews</p>
              <p className="text-2xl font-bold">
                {Object.values(applications).filter(a => a.status === "interview").length}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="glass-card p-6 space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Advanced Filters</h2>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by job title or company..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 border-2"
          />
        </div>

        {/* Skills */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Skills</label>
          <div className="flex flex-wrap gap-2">
            {skillOptions.map((skill) => (
              <Badge
                key={skill}
                variant={selectedSkills.includes(skill) ? "default" : "outline"}
                className="cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => toggleSkill(skill)}
              >
                {skill}
              </Badge>
            ))}
          </div>
        </div>

        {/* Tags Filter */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Filter by Tag</label>
            {selectedTagFilter && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedTagFilter(null)}
              >
                Clear
              </Button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {userTags.length === 0 ? (
              <p className="text-sm text-muted-foreground">No tags yet. Create tags to organize your jobs.</p>
            ) : (
              userTags.map((tag) => {
                // Count jobs with this tag
                const jobCount = Object.entries(jobTagsMap).filter(([_, tagIds]) => 
                  tagIds.includes(tag.id)
                ).length;
                
                return (
                  <Badge
                    key={tag.id}
                    className={`cursor-pointer hover:opacity-80 transition-opacity ${
                      selectedTagFilter === tag.id
                        ? getTagColorClass(tag.color)
                        : "bg-muted text-muted-foreground border-muted"
                    }`}
                    onClick={() => setSelectedTagFilter(selectedTagFilter === tag.id ? null : tag.id)}
                  >
                    <TagIcon className="h-3 w-3 mr-1" />
                    {tag.name}
                    <span className="ml-1 opacity-70">({jobCount})</span>
                  </Badge>
                );
              })
            )}
          </div>
        </div>

        {/* Salary Range */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Min Salary (USD)</label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="number"
                placeholder="50000"
                value={salaryMin}
                onChange={(e) => setSalaryMin(e.target.value)}
                className="pl-10 border-2"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Max Salary (USD)</label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="number"
                placeholder="150000"
                value={salaryMax}
                onChange={(e) => setSalaryMax(e.target.value)}
                className="pl-10 border-2"
              />
            </div>
          </div>
        </div>

        {/* Other Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Location</label>
            <Select value={location} onValueChange={setLocation}>
              <SelectTrigger className="border-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                <SelectItem value="worldwide">Worldwide</SelectItem>
                <SelectItem value="europe">Europe</SelectItem>
                <SelectItem value="usa">USA</SelectItem>
                <SelectItem value="asia">Asia</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Posted Within</label>
            <Select value={postedWithin} onValueChange={setPostedWithin}>
              <SelectTrigger className="border-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="1">Last 24 hours</SelectItem>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Job Type</label>
            <Select value={jobType} onValueChange={setJobType}>
              <SelectTrigger className="border-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="Full-time">Full-time</SelectItem>
                <SelectItem value="Contract">Contract</SelectItem>
                <SelectItem value="Part-time">Part-time</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Company Size</label>
            <Select value={companySize} onValueChange={setCompanySize}>
              <SelectTrigger className="border-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sizes</SelectItem>
                <SelectItem value="Startup">Startup</SelectItem>
                <SelectItem value="Mid-size">Mid-size</SelectItem>
                <SelectItem value="Enterprise">Enterprise</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="glass-card">
          <TabsTrigger value="all">All Jobs ({mockJobs.length})</TabsTrigger>
          <TabsTrigger value="saved">
            Saved ({Object.values(applications).filter(a => a.status === "saved").length})
          </TabsTrigger>
          <TabsTrigger value="applied">
            Applied ({Object.values(applications).filter(a => a.status === "applied").length})
          </TabsTrigger>
          <TabsTrigger value="interview">
            Interviews ({Object.values(applications).filter(a => a.status === "interview").length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4 mt-6">
          {filteredJobs.length === 0 ? (
            <Card className="glass-card p-12 text-center">
              <p className="text-muted-foreground">No jobs found matching your filters</p>
            </Card>
          ) : (
            filteredJobs.map((job) => (
              <Card key={job.id} className="glass-card p-6 space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3">
                      <h3 className="text-xl font-semibold">{job.title}</h3>
                      {applications[job.id]?.status && (
                        <Badge className={getStatusColor(applications[job.id].status)}>
                          <span className="flex items-center gap-1">
                            {getStatusIcon(applications[job.id].status)}
                            {applications[job.id].status}
                          </span>
                        </Badge>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Building2 className="h-4 w-4" />
                        {job.company}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {job.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4" />
                        {formatSalary(job.salaryMin, job.salaryMax)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Briefcase className="h-4 w-4" />
                        {job.jobType}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {formatPostedDate(job.postedDate)}
                      </span>
                    </div>

                    <p className="text-sm">{job.description}</p>

                    <div className="flex flex-wrap gap-2">
                      {job.skills.map((skill) => (
                        <Badge key={skill} variant="secondary">
                          {skill}
                        </Badge>
                      ))}
                    </div>

                    {/* Job Tags */}
                    {jobTagsMap[job.id] && jobTagsMap[job.id].length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {jobTagsMap[job.id].map((tagId) => {
                          const tag = userTags.find(t => t.id === tagId);
                          return tag ? (
                            <Badge key={tagId} className={getTagColorClass(tag.color)}>
                              <TagIcon className="h-3 w-3 mr-1" />
                              {tag.name}
                            </Badge>
                          ) : null;
                        })}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="default" size="sm">
                          <ExternalLink className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>{job.title}</DialogTitle>
                          <DialogDescription>{job.company}</DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4">
                          <div>
                            <h4 className="font-semibold mb-2">Description</h4>
                            <p className="text-sm text-muted-foreground">{job.description}</p>
                          </div>

                          <div>
                            <h4 className="font-semibold mb-2">Requirements</h4>
                            <ul className="list-disc list-inside space-y-1">
                              {job.requirements.map((req, idx) => (
                                <li key={idx} className="text-sm text-muted-foreground">{req}</li>
                              ))}
                            </ul>
                          </div>

                          <div>
                            <h4 className="font-semibold mb-2">Skills</h4>
                            <div className="flex flex-wrap gap-2">
                              {job.skills.map((skill) => (
                                <Badge key={skill} variant="secondary">{skill}</Badge>
                              ))}
                            </div>
                          </div>

                          <div className="space-y-2">
                            <h4 className="font-semibold">Application Status</h4>
                            <Select
                              value={applications[job.id]?.status || "none"}
                              onValueChange={(value) => updateApplicationStatus(job.id, value)}
                            >
                              <SelectTrigger className="border-2">
                                <SelectValue placeholder="Select status..." />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="none">Not Applied</SelectItem>
                                <SelectItem value="saved">Saved</SelectItem>
                                <SelectItem value="applied">Applied</SelectItem>
                                <SelectItem value="interview">Interview</SelectItem>
                                <SelectItem value="offer">Offer</SelectItem>
                                <SelectItem value="rejected">Rejected</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <h4 className="font-semibold">Tags</h4>
                            <div className="flex flex-wrap gap-2">
                              {userTags.length === 0 ? (
                                <p className="text-sm text-muted-foreground">No tags available. Create tags first.</p>
                              ) : (
                                userTags.map((tag) => {
                                  const isSelected = jobTagsMap[job.id]?.includes(tag.id);
                                  return (
                                    <Badge
                                      key={tag.id}
                                      className={`cursor-pointer hover:opacity-80 transition-opacity ${
                                        isSelected
                                          ? getTagColorClass(tag.color)
                                          : "bg-muted text-muted-foreground border-muted"
                                      }`}
                                      onClick={() => {
                                        const currentTags = jobTagsMap[job.id] || [];
                                        if (isSelected) {
                                          // Remove tag
                                          setJobTagsMap({
                                            ...jobTagsMap,
                                            [job.id]: currentTags.filter(id => id !== tag.id),
                                          });
                                        } else {
                                          // Add tag
                                          setJobTagsMap({
                                            ...jobTagsMap,
                                            [job.id]: [...currentTags, tag.id],
                                          });
                                        }
                                      }}
                                    >
                                      <TagIcon className="h-3 w-3 mr-1" />
                                      {tag.name}
                                    </Badge>
                                  );
                                })
                              )}
                            </div>
                          </div>

                          <div className="space-y-2">
                            <h4 className="font-semibold">Notes</h4>
                            <Textarea
                              placeholder="Add notes about this application..."
                              value={applications[job.id]?.notes || ""}
                              onChange={(e) => {
                                setApplications(prev => ({
                                  ...prev,
                                  [job.id]: {
                                    ...prev[job.id],
                                    status: prev[job.id]?.status || "saved",
                                    notes: e.target.value,
                                  },
                                }));
                              }}
                              className="border-2"
                              rows={4}
                            />
                          </div>

                          <Button
                            className="w-full"
                            onClick={() => {
                              const applyUrl = getSafeExternalUrl(job.applyUrl);
                              if (applyUrl) {
                                window.open(applyUrl, "_blank", "noopener,noreferrer");
                              }
                            }}
                          >
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Apply on {job.source}
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const currentStatus = applications[job.id]?.status;
                        if (currentStatus === "saved") {
                          const newApps = { ...applications };
                          delete newApps[job.id];
                          setApplications(newApps);
                          // Removed from saved
                        } else {
                          updateApplicationStatus(job.id, "saved");
                        }
                      }}
                    >
                      {applications[job.id]?.status === "saved" ? (
                        <BookmarkCheck className="h-4 w-4 mr-2" />
                      ) : (
                        <Bookmark className="h-4 w-4 mr-2" />
                      )}
                      {applications[job.id]?.status === "saved" ? "Saved" : "Save"}
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
