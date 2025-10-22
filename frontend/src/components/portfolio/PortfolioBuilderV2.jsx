import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { cn } from '../../utils/cn';
import ChatInterface from '../chat/ChatInterface';
import {
    Upload,
    FileText,
    Wand2,
    Eye,
    Download,
    Sparkles,
    Loader2,
    CheckCircle,
    MessageCircle,
    Edit,
    Save,
    ArrowRight
} from 'lucide-react';

const PortfolioBuilderV2 = () => {
    // Step tracking
    const [currentStep, setCurrentStep] = useState(1); // 1: Upload, 2: Review Data, 3: Generate, 4: Preview

    // Data states
    const [uploadedFile, setUploadedFile] = useState(null);
    const [extractedData, setExtractedData] = useState(null);
    const [portfolioData, setPortfolioData] = useState(null);
    const [generatedHTML, setGeneratedHTML] = useState('');

    // UI states
    const [isProcessing, setIsProcessing] = useState(false);
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState('modern');
    const [processingMessage, setProcessingMessage] = useState('');

    const fileInputRef = useRef(null);

    // Step 1: Handle Resume Upload
    const handleFileUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        if (file.size > 10 * 1024 * 1024) {
            alert('File size must be less than 10MB');
            return;
        }

        setUploadedFile(file);
        setIsProcessing(true);
        setProcessingMessage('📄 Uploading and parsing your resume...');

        const formData = new FormData();
        formData.append('resume', file);

        try {
            const response = await fetch('/api/portfolio/parse-resume', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();
            console.log('✅ Resume parsed:', result);
            console.log('📊 Extracted data:', result.data);

            if (result.success && result.data) {
                // Log what we got
                console.log('Name:', result.data.personal?.name);
                console.log('Skills:', result.data.skills?.technical);
                console.log('Experience:', result.data.experience?.length);

                setExtractedData(result.data);
                setPortfolioData(result.data);
                setCurrentStep(2);
                setProcessingMessage('✅ Resume data extracted successfully!');

                alert(`Resume parsed! Found:\n- Name: ${result.data.personal?.name}\n- Skills: ${result.data.skills?.technical?.length || 0}\n- Experience: ${result.data.experience?.length || 0} entries`);
            } else {
                throw new Error(result.error?.message || 'Failed to parse resume');
            }
        } catch (error) {
            console.error('❌ Upload error:', error);
            alert(`Failed to parse resume: ${error.message}`);
        } finally {
            setIsProcessing(false);
        }
    };

    // Step 2: Update portfolio data from form
    const handleDataUpdate = (field, value) => {
        setPortfolioData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    // Step 3: Generate Portfolio HTML
    const generatePortfolio = async () => {
        setIsProcessing(true);
        setProcessingMessage('🎨 Generating your beautiful AI-powered portfolio...');

        console.log('🚀 Generating portfolio with data:', portfolioData);
        console.log('🎨 Using template:', selectedTemplate);

        try {
            const response = await fetch('/api/portfolio/generate-html', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    portfolioData: portfolioData,
                    theme: selectedTemplate
                })
            });

            const result = await response.json();
            console.log('✅ Portfolio generated:', result);
            console.log('📝 HTML length:', result.htmlCode?.length);

            if (result.success && result.htmlCode) {
                setGeneratedHTML(result.htmlCode);
                setCurrentStep(4);
                setProcessingMessage('✅ AI-powered portfolio generated successfully!');
                alert('Portfolio generated with AI! Check the preview.');
            } else {
                throw new Error('Failed to generate portfolio');
            }
        } catch (error) {
            console.error('❌ Generation error:', error);
            alert(`Failed to generate portfolio: ${error.message}`);
        } finally {
            setIsProcessing(false);
        }
    };

    // Download portfolio
    const downloadPortfolio = () => {
        const blob = new Blob([generatedHTML], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'portfolio.html';
        a.click();
        URL.revokeObjectURL(url);
    };

    // Handle chat updates
    const handleChatUpdate = (updatedData) => {
        setPortfolioData(updatedData);
        // Regenerate if we're already at preview step
        if (currentStep === 4) {
            generatePortfolio();
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 p-6">
            <div className={cn("max-w-6xl mx-auto", isChatOpen && "mr-96")}>

                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
                        AI Portfolio Builder
                    </h1>
                    <p className="text-xl text-gray-600">
                        Upload your resume and get a stunning portfolio in minutes
                    </p>
                </div>

                {/* Progress Steps */}
                <div className="flex items-center justify-center mb-8 gap-4">
                    {[
                        { num: 1, label: 'Upload Resume' },
                        { num: 2, label: 'Review Data' },
                        { num: 3, label: 'Customize' },
                        { num: 4, label: 'Preview & Deploy' }
                    ].map((step, idx) => (
                        <React.Fragment key={step.num}>
                            <div className="flex flex-col items-center">
                                <div className={cn(
                                    "w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-all",
                                    currentStep >= step.num
                                        ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg"
                                        : "bg-gray-200 text-gray-500"
                                )}>
                                    {currentStep > step.num ? <CheckCircle className="w-6 h-6" /> : step.num}
                                </div>
                                <span className="text-sm mt-2 font-medium">{step.label}</span>
                            </div>
                            {idx < 3 && (
                                <div className={cn(
                                    "w-16 h-1 rounded mt-[-20px]",
                                    currentStep > step.num ? "bg-gradient-to-r from-blue-500 to-purple-600" : "bg-gray-200"
                                )} />
                            )}
                        </React.Fragment>
                    ))}
                </div>

                {/* Processing Message */}
                {isProcessing && (
                    <Card className="mb-6 bg-blue-50 border-blue-200">
                        <CardContent className="p-4 flex items-center gap-3">
                            <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                            <span className="text-blue-900 font-medium">{processingMessage}</span>
                        </CardContent>
                    </Card>
                )}

                {/* Step 1: Upload Resume */}
                {currentStep === 1 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Upload className="w-5 h-5" />
                                    Upload Your Resume
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-blue-400 transition-all cursor-pointer hover:bg-blue-50"
                                >
                                    <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                    <h3 className="text-xl font-semibold mb-2">
                                        Drop your resume here or click to browse
                                    </h3>
                                    <p className="text-gray-600 mb-4">
                                        Supports PDF, DOCX files (Max 10MB)
                                    </p>
                                    <Button>Choose File</Button>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept=".pdf,.docx,.doc"
                                        onChange={handleFileUpload}
                                        className="hidden"
                                    />
                                </div>

                                <div className="grid grid-cols-3 gap-4 mt-6">
                                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                                        <FileText className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                                        <h4 className="font-semibold">AI Extraction</h4>
                                        <p className="text-sm text-gray-600">Automatically extract all data</p>
                                    </div>
                                    <div className="text-center p-4 bg-green-50 rounded-lg">
                                        <Wand2 className="w-8 h-8 text-green-600 mx-auto mb-2" />
                                        <h4 className="font-semibold">Smart Generation</h4>
                                        <p className="text-sm text-gray-600">Create beautiful portfolio</p>
                                    </div>
                                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                                        <Sparkles className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                                        <h4 className="font-semibold">AI Chat Help</h4>
                                        <p className="text-sm text-gray-600">Get personalized suggestions</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}

                {/* Step 2: Review & Edit Data */}
                {currentStep === 2 && extractedData && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Edit className="w-5 h-5" />
                                    Review & Edit Your Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Personal Info */}
                                <div>
                                    <h3 className="font-semibold text-lg mb-3">Personal Information</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Name</label>
                                            <input
                                                type="text"
                                                value={portfolioData?.personal?.name || ''}
                                                onChange={(e) => handleDataUpdate('personal', { ...portfolioData.personal, name: e.target.value })}
                                                className="w-full p-2 border rounded-lg"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Email</label>
                                            <input
                                                type="email"
                                                value={portfolioData?.personal?.email || ''}
                                                onChange={(e) => handleDataUpdate('personal', { ...portfolioData.personal, email: e.target.value })}
                                                className="w-full p-2 border rounded-lg"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Phone</label>
                                            <input
                                                type="text"
                                                value={portfolioData?.personal?.phone || ''}
                                                onChange={(e) => handleDataUpdate('personal', { ...portfolioData.personal, phone: e.target.value })}
                                                className="w-full p-2 border rounded-lg"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Location</label>
                                            <input
                                                type="text"
                                                value={portfolioData?.personal?.location || ''}
                                                onChange={(e) => handleDataUpdate('personal', { ...portfolioData.personal, location: e.target.value })}
                                                className="w-full p-2 border rounded-lg"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Summary */}
                                <div>
                                    <h3 className="font-semibold text-lg mb-3">Professional Summary</h3>
                                    <textarea
                                        value={portfolioData?.summary || ''}
                                        onChange={(e) => handleDataUpdate('summary', e.target.value)}
                                        className="w-full p-3 border rounded-lg h-24"
                                        placeholder="Write a brief professional summary..."
                                    />
                                </div>

                                {/* Skills */}
                                <div>
                                    <h3 className="font-semibold text-lg mb-3">Skills</h3>
                                    <div className="flex flex-wrap gap-2 mb-2">
                                        {portfolioData?.skills?.technical?.map((skill, idx) => (
                                            <Badge key={idx} variant="secondary">{skill}</Badge>
                                        ))}
                                    </div>
                                    <p className="text-sm text-gray-600">
                                        {portfolioData?.skills?.technical?.length || 0} skills extracted
                                    </p>
                                </div>

                                {/* Experience */}
                                <div>
                                    <h3 className="font-semibold text-lg mb-3">Experience</h3>
                                    <p className="text-sm text-gray-600">
                                        {portfolioData?.experience?.length || 0} experience entries found
                                    </p>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex gap-3 pt-4">
                                    <Button
                                        onClick={() => setCurrentStep(1)}
                                        variant="outline"
                                    >
                                        Back
                                    </Button>
                                    <Button
                                        onClick={() => setCurrentStep(3)}
                                        className="flex-1"
                                    >
                                        Continue to Customize
                                        <ArrowRight className="w-4 h-4 ml-2" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}

                {/* Step 3: Customize & Generate */}
                {currentStep === 3 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Wand2 className="w-5 h-5" />
                                    Choose Template & Generate
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Template Selection */}
                                <div>
                                    <h3 className="font-semibold text-lg mb-3">Select Template</h3>
                                    <div className="grid grid-cols-3 gap-4">
                                        {['modern', 'creative', 'professional'].map((template) => (
                                            <div
                                                key={template}
                                                onClick={() => setSelectedTemplate(template)}
                                                className={cn(
                                                    "p-4 border-2 rounded-lg cursor-pointer transition-all",
                                                    selectedTemplate === template
                                                        ? "border-blue-500 bg-blue-50"
                                                        : "border-gray-200 hover:border-blue-300"
                                                )}
                                            >
                                                <div className="h-32 bg-gradient-to-br from-blue-100 to-purple-100 rounded mb-2"></div>
                                                <h4 className="font-semibold capitalize">{template}</h4>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Generate Button */}
                                <div className="flex gap-3">
                                    <Button
                                        onClick={() => setCurrentStep(2)}
                                        variant="outline"
                                    >
                                        Back
                                    </Button>
                                    <Button
                                        onClick={generatePortfolio}
                                        disabled={isProcessing}
                                        className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600"
                                    >
                                        {isProcessing ? (
                                            <>
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                Generating...
                                            </>
                                        ) : (
                                            <>
                                                <Sparkles className="w-4 h-4 mr-2" />
                                                Generate Portfolio
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}

                {/* Step 4: Preview & Deploy */}
                {currentStep === 4 && generatedHTML && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center justify-between">
                                    <span className="flex items-center gap-2">
                                        <Eye className="w-5 h-5" />
                                        Your Portfolio is Ready!
                                    </span>
                                    <div className="flex gap-2">
                                        <Button onClick={downloadPortfolio} variant="outline">
                                            <Download className="w-4 h-4 mr-2" />
                                            Download HTML
                                        </Button>
                                        <Button onClick={() => setIsChatOpen(true)}>
                                            <MessageCircle className="w-4 h-4 mr-2" />
                                            Get AI Suggestions
                                        </Button>
                                    </div>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="border rounded-lg overflow-hidden bg-white">
                                    <iframe
                                        srcDoc={generatedHTML}
                                        className="w-full h-[600px] border-0"
                                        title="Portfolio Preview"
                                    />
                                </div>

                                <div className="flex gap-3 mt-6">
                                    <Button
                                        onClick={() => setCurrentStep(3)}
                                        variant="outline"
                                    >
                                        Change Template
                                    </Button>
                                    <Button
                                        onClick={() => setCurrentStep(2)}
                                        variant="outline"
                                    >
                                        Edit Data
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}

                {/* AI Chat Button */}
                {!isChatOpen && currentStep > 1 && (
                    <div className="fixed bottom-6 right-6 z-50">
                        <Button
                            onClick={() => setIsChatOpen(true)}
                            className="rounded-full w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-600 shadow-lg"
                        >
                            <MessageCircle className="w-6 h-6" />
                        </Button>
                    </div>
                )}
            </div>

            {/* AI Chat Interface */}
            <AnimatePresence>
                {isChatOpen && portfolioData && (
                    <ChatInterface
                        portfolioData={portfolioData}
                        onPortfolioUpdate={handleChatUpdate}
                        onSuggestionApply={(action) => {
                            console.log('Applying suggestion:', action);
                            if (action.type === 'update_summary') {
                                handleDataUpdate('summary', action.data);
                            }
                        }}
                        isMinimized={false}
                        onToggleMinimize={() => setIsChatOpen(false)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default PortfolioBuilderV2;