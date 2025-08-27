import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Brain, Languages, Plus, Mic } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "../lib/queryClient";
import { useToast } from "../hooks/use-toast";

export default function LearningAssistant({ userId, onVoiceCommand }) {
  const [newContent, setNewContent] = useState({
    type: "flashcard",
    title: "",
    content: "",
    language: "en",
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: learningContent = [] } = useQuery({
    queryKey: ["/api/learning", userId],
    enabled: !!userId,
  });

  const addContentMutation = useMutation({
    mutationFn: async (content) => {
      const response = await apiRequest("POST", "/api/learning", {
        ...content,
        userId,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/learning", userId] });
      setNewContent({ type: "flashcard", title: "", content: "", language: "en" });
      toast({
        title: "Content Added",
        description: "Learning content created successfully",
      });
    },
  });

  const flashcards = learningContent.filter((item) => item.type === "flashcard");
  const quizzes = learningContent.filter((item) => item.type === "quiz");
  const definitions = learningContent.filter((item) => item.type === "definition");

  const handleAddContent = () => {
    if (!newContent.title || !newContent.content) {
      toast({
        title: "Missing Information",
        description: "Please fill in both title and content",
        variant: "destructive",
      });
      return;
    }
    addContentMutation.mutate(newContent);
  };

  const speakContent = (text, language) => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language === "ta" ? "ta-IN" : "en-US";
      speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
              <Brain className="text-white w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900" data-testid="text-learning-title">
                Learning Assistant
              </h2>
              <p className="text-sm text-gray-500">
                Voice-driven learning with flashcards, quizzes, and definitions
              </p>
            </div>
          </div>

          <Tabs defaultValue="flashcards" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="flashcards">Flashcards</TabsTrigger>
              <TabsTrigger value="quizzes">Quizzes</TabsTrigger>
              <TabsTrigger value="definitions">Definitions</TabsTrigger>
              <TabsTrigger value="create">Create</TabsTrigger>
            </TabsList>

            {/* Flashcards */}
            <TabsContent value="flashcards" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {flashcards.map((card) => (
                  <Card key={card.id} className="border-l-4 border-l-blue-500">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold">{card.title}</h3>
                        <div className="flex space-x-2">
                          <Languages className={`w-4 h-4 ${card.language === "ta" ? "text-orange-500" : "text-blue-500"}`} />
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => speakContent(card.content, card.language)}
                            data-testid={`button-speak-${card.id}`}
                          >
                            <Mic className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-gray-600 text-sm">{card.content}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
              {flashcards.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <BookOpen className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No flashcards yet. Create some to get started!</p>
                </div>
              )}
            </TabsContent>

            {/* Quizzes */}
            <TabsContent value="quizzes" className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                {quizzes.map((quiz) => (
                  <Card key={quiz.id} className="border-l-4 border-l-green-500">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold">{quiz.title}</h3>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => speakContent(quiz.content, quiz.language)}
                          data-testid={`button-speak-quiz-${quiz.id}`}
                        >
                          <Mic className="w-3 h-3" />
                        </Button>
                      </div>
                      <p className="text-gray-600 text-sm">{quiz.content}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
              {quizzes.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Brain className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No quizzes yet. Create some to test your knowledge!</p>
                </div>
              )}
            </TabsContent>

            {/* Definitions */}
            <TabsContent value="definitions" className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                {definitions.map((def) => (
                  <Card key={def.id} className="border-l-4 border-l-purple-500">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold">{def.title}</h3>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => speakContent(def.content, def.language)}
                          data-testid={`button-speak-def-${def.id}`}
                        >
                          <Mic className="w-3 h-3" />
                        </Button>
                      </div>
                      <p className="text-gray-600 text-sm">{def.content}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
              {definitions.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <BookOpen className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No definitions yet. Add some vocabulary!</p>
                </div>
              )}
            </TabsContent>

            {/* Create Content */}
            <TabsContent value="create" className="space-y-4">
              <Card>
                <CardContent className="p-6 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="contentType">Content Type</Label>
                      <select
                        id="contentType"
                        value={newContent.type}
                        onChange={(e) => setNewContent((prev) => ({ ...prev, type: e.target.value }))}
                        className="w-full mt-1 p-2 border rounded-md"
                        data-testid="select-content-type"
                      >
                        <option value="flashcard">Flashcard</option>
                        <option value="quiz">Quiz</option>
                        <option value="definition">Definition</option>
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="language">Language</Label>
                      <select
                        id="language"
                        value={newContent.language}
                        onChange={(e) => setNewContent((prev) => ({ ...prev, language: e.target.value }))}
                        className="w-full mt-1 p-2 border rounded-md"
                        data-testid="select-language"
                      >
                        <option value="en">English</option>
                        <option value="ta">Tamil</option>
                        <option value="mixed">Mixed (English + Tamil)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={newContent.title}
                      onChange={(e) => setNewContent((prev) => ({ ...prev, title: e.target.value }))}
                      placeholder="Enter title"
                      data-testid="input-content-title"
                    />
                  </div>

                  <div>
                    <Label htmlFor="content">Content</Label>
                    <textarea
                      id="content"
                      value={newContent.content}
                      onChange={(e) => setNewContent((prev) => ({ ...prev, content: e.target.value }))}
                      placeholder="Enter content"
                      className="w-full mt-1 p-2 border rounded-md h-24"
                      data-testid="textarea-content"
                    />
                  </div>

                  <Button
                    onClick={handleAddContent}
                    disabled={addContentMutation.isPending}
                    className="w-full"
                    data-testid="button-add-content"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    {addContentMutation.isPending ? "Adding..." : "Add Content"}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
