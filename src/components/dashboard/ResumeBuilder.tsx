import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import {
  FileText,
  Download,
  Plus,
  Trash2,
  Briefcase,
  GraduationCap,
  Award,
  Code,
  MapPin,
  Mail,
  Phone,
  Globe,
  Save,
  User,
  Eye,
  Edit3,
  CheckCircle2,
} from 'lucide-react';

interface ResumeData {
  summary: string;
  education: { id: string; school: string; degree: string; year: string }[];
  experience: { id: string; company: string; role: string; duration: string; description: string }[];
  certifications: { id: string; name: string; issuer: string; date: string }[];
  languages: string[];
  skills: string[];
}

export default function ResumeBuilder() {
  const { profile } = useAuth();
  const [resumeData, setResumeData] = useState<ResumeData>({
    summary: '',
    education: [],
    experience: [],
    certifications: [],
    languages: [],
    skills: [],
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [mode, setMode] = useState<'edit' | 'preview'>('edit');
  const [newSkill, setNewSkill] = useState('');
  const [newLang, setNewLang] = useState('');
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadResume();
  }, [profile]);

  const loadResume = async () => {
    setLoading(true);

    const { data } = await supabase
      .from('profiles')
      .select('skills')
      .eq('id', profile?.id || '')
      .maybeSingle();

    if (data) {
      setResumeData({
        summary: 'Motivated and detail-oriented digital worker with experience in AI training tasks and data annotation. Proven track record of delivering high-quality work on online platforms. Passionate about continuous learning and leveraging technology to create value.',
        education: [
          { id: '1', school: 'University of Nairobi', degree: 'Bachelor of Computer Science', year: '2020' },
        ],
        experience: [
          { id: '1', company: 'EarnIQ Africa', role: 'AI Data Trainer', duration: '2023 - Present', description: 'Completed 150+ AI training tasks including data annotation, content moderation, and quality assurance.' },
        ],
        certifications: [
          { id: '1', name: 'AI & Machine Learning Fundamentals', issuer: 'EarnIQ', date: '2024' },
        ],
        languages: ['English', 'Swahili'],
        skills: (data.skills as string[]) || ['Data Annotation', 'Content Moderation', 'Quality Assurance'],
      });
    }

    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    if (profile?.id) {
      await supabase
        .from('profiles')
        .update({ skills: resumeData.skills })
        .eq('id', profile.id);
    }
    await new Promise((r) => setTimeout(r, 600));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const addEducation = () => {
    setResumeData(prev => ({
      ...prev,
      education: [...prev.education, { id: Date.now().toString(), school: '', degree: '', year: '' }],
    }));
  };

  const addExperience = () => {
    setResumeData(prev => ({
      ...prev,
      experience: [...prev.experience, { id: Date.now().toString(), company: '', role: '', duration: '', description: '' }],
    }));
  };

  const addCertification = () => {
    setResumeData(prev => ({
      ...prev,
      certifications: [...prev.certifications, { id: Date.now().toString(), name: '', issuer: '', date: '' }],
    }));
  };

  const removeItem = (section: 'education' | 'experience' | 'certifications', id: string) => {
    setResumeData(prev => ({
      ...prev,
      [section]: prev[section].filter((item: { id: string }) => item.id !== id),
    }));
  };

  const updateItem = (section: 'education' | 'experience' | 'certifications', id: string, field: string, value: string) => {
    setResumeData(prev => ({
      ...prev,
      [section]: prev[section].map((item: Record<string, string>) =>
        item.id === id ? { ...item, [field]: value } : item
      ),
    }));
  };

  const addSkill = () => {
    if (newSkill.trim()) {
      setResumeData(prev => ({ ...prev, skills: [...prev.skills, newSkill.trim()] }));
      setNewSkill('');
    }
  };

  const removeSkill = (idx: number) => {
    setResumeData(prev => ({ ...prev, skills: prev.skills.filter((_, i) => i !== idx) }));
  };

  const addLanguage = () => {
    if (newLang.trim()) {
      setResumeData(prev => ({ ...prev, languages: [...prev.languages, newLang.trim()] }));
      setNewLang('');
    }
  };

  const removeLanguage = (idx: number) => {
    setResumeData(prev => ({ ...prev, languages: prev.languages.filter((_, i) => i !== idx) }));
  };

  const handleDownload = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const html = generateResumeHTML();
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };

  const generateResumeHTML = () => {
    const fullName = profile?.full_name || 'Your Name';
    const email = profile?.email || '';
    const phone = profile?.phone || '';
    const city = profile?.city || '';
    const country = profile?.country || '';

    return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>${fullName} - Resume</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Georgia', serif; color: #1a1a1a; background: #f5f5f5; padding: 40px; }
  .resume { max-width: 800px; margin: 0 auto; background: white; padding: 48px; border-radius: 8px; box-shadow: 0 2px 20px rgba(0,0,0,0.08); }
  .header { text-align: center; border-bottom: 3px solid #059669; padding-bottom: 20px; margin-bottom: 24px; }
  .header h1 { font-size: 28px; color: #1a1a1a; letter-spacing: 1px; }
  .header .title { font-size: 14px; color: #059669; text-transform: uppercase; letter-spacing: 2px; margin-top: 4px; }
  .contact { font-size: 12px; color: #666; margin-top: 8px; }
  .contact span { margin: 0 8px; }
  .section { margin-bottom: 20px; }
  .section h2 { font-size: 14px; text-transform: uppercase; letter-spacing: 2px; color: #059669; border-bottom: 1px solid #d1d5db; padding-bottom: 6px; margin-bottom: 12px; }
  .summary { font-size: 13px; line-height: 1.6; color: #333; }
  .exp-item { margin-bottom: 14px; }
  .exp-item .role { font-weight: bold; font-size: 14px; }
  .exp-item .company { font-size: 13px; color: #555; }
  .exp-item .duration { font-size: 12px; color: #888; font-style: italic; }
  .exp-item .desc { font-size: 13px; color: #444; margin-top: 4px; line-height: 1.5; }
  .edu-item { margin-bottom: 10px; }
  .edu-item .degree { font-weight: bold; font-size: 14px; }
  .edu-item .school { font-size: 13px; color: #555; }
  .edu-item .year { font-size: 12px; color: #888; }
  .cert-item { margin-bottom: 8px; font-size: 13px; }
  .cert-item .name { font-weight: bold; }
  .skills { display: flex; flex-wrap: wrap; gap: 8px; }
  .skill-tag { background: #ecfdf5; color: #059669; padding: 3px 12px; border-radius: 12px; font-size: 12px; font-weight: 500; }
  .langs { font-size: 13px; color: #444; }
  @media print { body { padding: 0; background: white; } .resume { box-shadow: none; } }
</style>
</head>
<body>
<div class="resume">
  <div class="header">
    <h1>${fullName}</h1>
    <div class="title">AI Data Trainer | Digital Worker</div>
    <div class="contact">
      ${email ? `<span>${email}</span>` : ''}
      ${phone ? `<span>${phone}</span>` : ''}
      ${city ? `<span>${city}${country ? ', ' + country : ''}</span>` : ''}
    </div>
  </div>
  ${resumeData.summary ? `<div class="section"><h2>Professional Summary</h2><p class="summary">${resumeData.summary}</p></div>` : ''}
  ${resumeData.experience.length > 0 ? `<div class="section"><h2>Experience</h2>${resumeData.experience.map(e => `
    <div class="exp-item">
      <div class="role">${e.role || ''}</div>
      <div class="company">${e.company || ''}</div>
      <div class="duration">${e.duration || ''}</div>
      <div class="desc">${e.description || ''}</div>
    </div>`).join('')}</div>` : ''}
  ${resumeData.education.length > 0 ? `<div class="section"><h2>Education</h2>${resumeData.education.map(e => `
    <div class="edu-item">
      <div class="degree">${e.degree || ''}</div>
      <div class="school">${e.school || ''}</div>
      <div class="year">${e.year || ''}</div>
    </div>`).join('')}</div>` : ''}
  ${resumeData.certifications.length > 0 ? `<div class="section"><h2>Certifications</h2>${resumeData.certifications.map(c => `
    <div class="cert-item"><span class="name">${c.name || ''}</span> — ${c.issuer || ''} (${c.date || ''})</div>`).join('')}</div>` : ''}
  ${resumeData.skills.length > 0 ? `<div class="section"><h2>Skills</h2><div class="skills">${resumeData.skills.map(s => `<span class="skill-tag">${s}</span>`).join('')}</div></div>` : ''}
  ${resumeData.languages.length > 0 ? `<div class="section"><h2>Languages</h2><p class="langs">${resumeData.languages.join(', ')}</p></div>` : ''}
</div>
</body>
</html>`;
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto py-20 text-center">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-secondary-500">Loading resume builder...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold mb-2">
            <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600 bg-clip-text text-transparent">Resume Builder</span>
          </h1>
          <p className="text-secondary-600 dark:text-secondary-400">Create a professional resume showcasing your EarnIQ experience</p>
        </div>
        <div className="flex gap-3">
          <div className="flex bg-secondary-100 dark:bg-secondary-700 rounded-lg p-1">
            <button
              onClick={() => setMode('edit')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${mode === 'edit' ? 'bg-white dark:bg-secondary-800 text-emerald-600 shadow-sm' : 'text-secondary-500'}`}
            >
              <Edit3 className="w-4 h-4" />
              Edit
            </button>
            <button
              onClick={() => setMode('preview')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${mode === 'preview' ? 'bg-white dark:bg-secondary-800 text-emerald-600 shadow-sm' : 'text-secondary-500'}`}
            >
              <Eye className="w-4 h-4" />
              Preview
            </button>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-white dark:bg-secondary-800 border-2 border-secondary-200 dark:border-secondary-600 text-secondary-700 dark:text-secondary-300 px-4 py-2 rounded-lg font-medium hover:border-emerald-300 transition-all disabled:opacity-50 flex items-center gap-2"
          >
            {saved ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Save className="w-4 h-4" />}
            {saving ? 'Saving...' : saved ? 'Saved!' : 'Save'}
          </button>
          <button
            onClick={handleDownload}
            className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-5 py-2 rounded-lg font-semibold hover:from-emerald-600 hover:to-teal-700 transition-all shadow-lg shadow-emerald-500/20 hover:scale-[1.02] flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Download PDF
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Edit / Preview Area */}
        <div className="lg:col-span-2 space-y-6" ref={previewRef}>
          {mode === 'edit' ? (
            <>
              {/* Header Card */}
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl p-6">
                <div className="flex items-start gap-4">
                  <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-xl flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                    {profile?.full_name?.charAt(0) || 'U'}
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-secondary-900 dark:text-white">{profile?.full_name || 'Your Name'}</h2>
                    <p className="text-emerald-600 dark:text-emerald-400 font-medium mb-2">AI Data Trainer | Digital Worker</p>
                    <div className="flex flex-wrap gap-4 text-sm text-secondary-500 dark:text-secondary-400">
                      {profile?.email && (
                        <span className="flex items-center gap-1">
                          <Mail className="w-4 h-4" />
                          {profile.email}
                        </span>
                      )}
                      {profile?.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="w-4 h-4" />
                          {profile.phone}
                        </span>
                      )}
                      {profile?.city && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {profile.city}, {profile.country}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Summary */}
              <div className="bg-white dark:bg-secondary-800 border border-secondary-200 dark:border-secondary-700 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-secondary-900 dark:text-white mb-4 flex items-center gap-2">
                  <User className="w-5 h-5 text-emerald-600" />
                  Professional Summary
                </h3>
                <textarea
                  value={resumeData.summary}
                  onChange={(e) => setResumeData(prev => ({ ...prev, summary: e.target.value }))}
                  rows={4}
                  className="w-full border border-secondary-200 dark:border-secondary-600 rounded-lg p-3 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white dark:bg-secondary-700 text-secondary-900 dark:text-white transition-all"
                  placeholder="Write a brief professional summary..."
                />
              </div>

              {/* Experience */}
              <div className="bg-white dark:bg-secondary-800 border border-secondary-200 dark:border-secondary-700 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-secondary-900 dark:text-white flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-emerald-600" />
                    Experience
                  </h3>
                  <button
                    onClick={addExperience}
                    className="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-sm font-medium hover:bg-emerald-100 transition-colors px-3 py-1.5 rounded-lg flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4" />
                    Add
                  </button>
                </div>
                <div className="space-y-4">
                  {resumeData.experience.map((exp) => (
                    <div key={exp.id} className="border border-secondary-100 dark:border-secondary-700 rounded-lg p-4 hover:border-emerald-200 transition-colors">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
                            <Briefcase className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                          </div>
                          <div>
                            <input
                              type="text"
                              value={exp.role}
                              onChange={(e) => updateItem('experience', exp.id, 'role', e.target.value)}
                              className="font-semibold text-secondary-900 dark:text-white border-b border-transparent hover:border-secondary-200 focus:border-emerald-500 focus:outline-none bg-transparent"
                              placeholder="Role Title"
                            />
                            <input
                              type="text"
                              value={exp.company}
                              onChange={(e) => updateItem('experience', exp.id, 'company', e.target.value)}
                              className="block text-sm text-secondary-600 dark:text-secondary-400 border-b border-transparent hover:border-secondary-200 focus:border-emerald-500 focus:outline-none bg-transparent"
                              placeholder="Company Name"
                            />
                          </div>
                        </div>
                        <button
                          onClick={() => removeItem('experience', exp.id)}
                          className="text-red-500 hover:text-red-700 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <input
                        type="text"
                        value={exp.duration}
                        onChange={(e) => updateItem('experience', exp.id, 'duration', e.target.value)}
                        className="text-sm text-secondary-500 mb-2 block border-b border-transparent hover:border-secondary-200 focus:border-emerald-500 focus:outline-none bg-transparent"
                        placeholder="Duration (e.g., Jan 2023 - Present)"
                      />
                      <textarea
                        value={exp.description}
                        onChange={(e) => updateItem('experience', exp.id, 'description', e.target.value)}
                        rows={2}
                        className="w-full text-sm text-secondary-700 dark:text-secondary-300 border border-secondary-200 dark:border-secondary-600 rounded-lg p-2 focus:ring-2 focus:ring-emerald-500 bg-white dark:bg-secondary-700"
                        placeholder="Describe your responsibilities and achievements..."
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Education */}
              <div className="bg-white dark:bg-secondary-800 border border-secondary-200 dark:border-secondary-700 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-secondary-900 dark:text-white flex items-center gap-2">
                    <GraduationCap className="w-5 h-5 text-blue-600" />
                    Education
                  </h3>
                  <button
                    onClick={addEducation}
                    className="bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-sm font-medium hover:bg-blue-100 transition-colors px-3 py-1.5 rounded-lg flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4" />
                    Add
                  </button>
                </div>
                <div className="space-y-4">
                  {resumeData.education.map((edu) => (
                    <div key={edu.id} className="flex items-start gap-4 p-4 border border-secondary-100 dark:border-secondary-700 rounded-lg hover:border-blue-200 transition-colors">
                      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                        <GraduationCap className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="flex-1">
                        <input
                          type="text"
                          value={edu.school}
                          onChange={(e) => updateItem('education', edu.id, 'school', e.target.value)}
                          className="font-semibold text-secondary-900 dark:text-white block w-full border-b border-transparent hover:border-secondary-200 focus:border-blue-500 focus:outline-none bg-transparent"
                          placeholder="School/University"
                        />
                        <input
                          type="text"
                          value={edu.degree}
                          onChange={(e) => updateItem('education', edu.id, 'degree', e.target.value)}
                          className="text-sm text-secondary-600 dark:text-secondary-400 block w-full border-b border-transparent hover:border-secondary-200 focus:border-blue-500 focus:outline-none bg-transparent"
                          placeholder="Degree/Certificate"
                        />
                        <input
                          type="text"
                          value={edu.year}
                          onChange={(e) => updateItem('education', edu.id, 'year', e.target.value)}
                          className="text-sm text-secondary-500 block w-full border-b border-transparent hover:border-secondary-200 focus:border-blue-500 focus:outline-none bg-transparent"
                          placeholder="Year"
                        />
                      </div>
                      <button
                        onClick={() => removeItem('education', edu.id)}
                        className="text-red-500 hover:text-red-700 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Certifications */}
              <div className="bg-white dark:bg-secondary-800 border border-secondary-200 dark:border-secondary-700 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-secondary-900 dark:text-white flex items-center gap-2">
                    <Award className="w-5 h-5 text-amber-600" />
                    Certifications
                  </h3>
                  <button
                    onClick={addCertification}
                    className="bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 text-sm font-medium hover:bg-amber-100 transition-colors px-3 py-1.5 rounded-lg flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4" />
                    Add
                  </button>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  {resumeData.certifications.map((cert) => (
                    <div key={cert.id} className="flex items-start gap-3 p-4 border border-secondary-100 dark:border-secondary-700 rounded-lg hover:border-amber-200 transition-colors">
                      <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center">
                        <Award className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                      </div>
                      <div className="flex-1">
                        <input
                          type="text"
                          value={cert.name}
                          onChange={(e) => updateItem('certifications', cert.id, 'name', e.target.value)}
                          className="font-medium text-secondary-900 dark:text-white block w-full border-b border-transparent hover:border-secondary-200 focus:border-amber-500 focus:outline-none bg-transparent text-sm"
                          placeholder="Certification Name"
                        />
                        <input
                          type="text"
                          value={cert.issuer}
                          onChange={(e) => updateItem('certifications', cert.id, 'issuer', e.target.value)}
                          className="text-xs text-secondary-500 block w-full border-b border-transparent hover:border-secondary-200 focus:border-amber-500 focus:outline-none bg-transparent"
                          placeholder="Issuing Organization"
                        />
                        <input
                          type="text"
                          value={cert.date}
                          onChange={(e) => updateItem('certifications', cert.id, 'date', e.target.value)}
                          className="text-xs text-secondary-400 block w-full border-b border-transparent hover:border-secondary-200 focus:border-amber-500 focus:outline-none bg-transparent"
                          placeholder="Date"
                        />
                      </div>
                      <button
                        onClick={() => removeItem('certifications', cert.id)}
                        className="text-red-500 hover:text-red-700 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Skills */}
              <div className="bg-white dark:bg-secondary-800 border border-secondary-200 dark:border-secondary-700 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-secondary-900 dark:text-white mb-4 flex items-center gap-2">
                  <Code className="w-5 h-5 text-purple-600" />
                  Skills
                </h3>
                <div className="flex gap-2 mb-4">
                  <input
                    type="text"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addSkill()}
                    placeholder="Add a skill..."
                    className="flex-1 border border-secondary-200 dark:border-secondary-600 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white dark:bg-secondary-700 text-secondary-900 dark:text-white"
                  />
                  <button
                    onClick={addSkill}
                    className="bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 px-3 py-2 rounded-lg text-sm font-medium hover:bg-purple-200 transition-colors flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {resumeData.skills.map((skill, i) => (
                    <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 text-purple-700 dark:text-purple-300 rounded-full text-sm font-medium border border-purple-200 dark:border-purple-800">
                      {skill}
                      <button onClick={() => removeSkill(i)} className="text-purple-400 hover:text-red-500 transition-colors">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Languages */}
              <div className="bg-white dark:bg-secondary-800 border border-secondary-200 dark:border-secondary-700 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-secondary-900 dark:text-white mb-4 flex items-center gap-2">
                  <Globe className="w-5 h-5 text-teal-600" />
                  Languages
                </h3>
                <div className="flex gap-2 mb-4">
                  <input
                    type="text"
                    value={newLang}
                    onChange={(e) => setNewLang(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addLanguage()}
                    placeholder="Add a language..."
                    className="flex-1 border border-secondary-200 dark:border-secondary-600 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white dark:bg-secondary-700 text-secondary-900 dark:text-white"
                  />
                  <button
                    onClick={addLanguage}
                    className="bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 px-3 py-2 rounded-lg text-sm font-medium hover:bg-teal-200 transition-colors flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {resumeData.languages.map((lang, i) => (
                    <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20 text-teal-700 dark:text-teal-300 rounded-full text-sm font-medium border border-teal-200 dark:border-teal-800">
                      {lang}
                      <button onClick={() => removeLanguage(i)} className="text-teal-400 hover:text-red-500 transition-colors">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </>
          ) : (
            /* Preview Mode */
            <div className="bg-white rounded-xl shadow-lg p-8 lg:p-12" style={{ minHeight: '600px' }}>
              <div className="text-center border-b-3 border-emerald-600 pb-6 mb-6" style={{ borderBottom: '3px solid #059669' }}>
                <h1 className="text-3xl font-bold text-secondary-900 tracking-wide">{profile?.full_name || 'Your Name'}</h1>
                <p className="text-sm text-emerald-600 uppercase tracking-widest mt-1">AI Data Trainer | Digital Worker</p>
                <div className="text-xs text-secondary-500 mt-2">
                  {profile?.email && <span className="mx-2">{profile.email}</span>}
                  {profile?.phone && <span className="mx-2">{profile.phone}</span>}
                  {profile?.city && <span className="mx-2">{profile.city}{profile?.country ? ', ' + profile.country : ''}</span>}
                </div>
              </div>

              {resumeData.summary && (
                <div className="mb-6">
                  <h2 className="text-sm uppercase tracking-widest text-emerald-600 border-b border-secondary-200 pb-2 mb-3 font-semibold">Professional Summary</h2>
                  <p className="text-sm text-secondary-700 leading-relaxed">{resumeData.summary}</p>
                </div>
              )}

              {resumeData.experience.length > 0 && (
                <div className="mb-6">
                  <h2 className="text-sm uppercase tracking-widest text-emerald-600 border-b border-secondary-200 pb-2 mb-3 font-semibold">Experience</h2>
                  {resumeData.experience.map((exp) => (
                    <div key={exp.id} className="mb-4">
                      <p className="font-bold text-sm text-secondary-900">{exp.role}</p>
                      <p className="text-sm text-secondary-600">{exp.company}</p>
                      <p className="text-xs text-secondary-400 italic">{exp.duration}</p>
                      <p className="text-sm text-secondary-600 mt-1 leading-relaxed">{exp.description}</p>
                    </div>
                  ))}
                </div>
              )}

              {resumeData.education.length > 0 && (
                <div className="mb-6">
                  <h2 className="text-sm uppercase tracking-widest text-emerald-600 border-b border-secondary-200 pb-2 mb-3 font-semibold">Education</h2>
                  {resumeData.education.map((edu) => (
                    <div key={edu.id} className="mb-2">
                      <p className="font-bold text-sm text-secondary-900">{edu.degree}</p>
                      <p className="text-sm text-secondary-600">{edu.school}</p>
                      <p className="text-xs text-secondary-400">{edu.year}</p>
                    </div>
                  ))}
                </div>
              )}

              {resumeData.certifications.length > 0 && (
                <div className="mb-6">
                  <h2 className="text-sm uppercase tracking-widest text-emerald-600 border-b border-secondary-200 pb-2 mb-3 font-semibold">Certifications</h2>
                  {resumeData.certifications.map((cert) => (
                    <p key={cert.id} className="text-sm text-secondary-700 mb-1">
                      <span className="font-bold">{cert.name}</span> — {cert.issuer} ({cert.date})
                    </p>
                  ))}
                </div>
              )}

              {resumeData.skills.length > 0 && (
                <div className="mb-6">
                  <h2 className="text-sm uppercase tracking-widest text-emerald-600 border-b border-secondary-200 pb-2 mb-3 font-semibold">Skills</h2>
                  <div className="flex flex-wrap gap-2">
                    {resumeData.skills.map((skill, i) => (
                      <span key={i} className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-medium">{skill}</span>
                    ))}
                  </div>
                </div>
              )}

              {resumeData.languages.length > 0 && (
                <div>
                  <h2 className="text-sm uppercase tracking-widest text-emerald-600 border-b border-secondary-200 pb-2 mb-3 font-semibold">Languages</h2>
                  <p className="text-sm text-secondary-700">{resumeData.languages.join(', ')}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl p-6 sticky top-24">
            <h3 className="font-semibold text-emerald-900 dark:text-emerald-300 mb-4 flex items-center gap-2">
              <Award className="w-5 h-5" />
              Resume Tips
            </h3>
            <ul className="space-y-3 text-sm text-emerald-700 dark:text-emerald-400">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>Highlight your EarnIQ achievements and completed tasks</span>
              </li>
              <li className="flex items-start gap-2">
                <Code className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>List specific skills you've developed through online tasks</span>
              </li>
              <li className="flex items-start gap-2">
                <GraduationCap className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>Include relevant courses and certifications</span>
              </li>
              <li className="flex items-start gap-2">
                <Globe className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>Add links to your professional profiles</span>
              </li>
            </ul>
          </div>

          <div className="bg-white dark:bg-secondary-800 border border-secondary-200 dark:border-secondary-700 rounded-xl p-6">
            <h3 className="font-semibold text-secondary-900 dark:text-white mb-3 flex items-center gap-2">
              <FileText className="w-5 h-5 text-emerald-600" />
              Quick Stats
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-secondary-500 dark:text-secondary-400">Experience entries</span>
                <span className="font-bold text-secondary-900 dark:text-white">{resumeData.experience.length}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-secondary-500 dark:text-secondary-400">Education entries</span>
                <span className="font-bold text-secondary-900 dark:text-white">{resumeData.education.length}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-secondary-500 dark:text-secondary-400">Certifications</span>
                <span className="font-bold text-secondary-900 dark:text-white">{resumeData.certifications.length}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-secondary-500 dark:text-secondary-400">Skills listed</span>
                <span className="font-bold text-secondary-900 dark:text-white">{resumeData.skills.length}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-secondary-500 dark:text-secondary-400">Languages</span>
                <span className="font-bold text-secondary-900 dark:text-white">{resumeData.languages.length}</span>
              </div>
            </div>
            <button
              onClick={handleDownload}
              className="w-full mt-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-2.5 rounded-lg text-sm font-semibold hover:from-emerald-600 hover:to-teal-700 transition-all flex items-center justify-center gap-2 shadow-md"
            >
              <Download className="w-4 h-4" />
              Download as PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
