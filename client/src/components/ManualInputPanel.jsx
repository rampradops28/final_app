import { useState } from "react";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Keyboard, Send } from "lucide-react";

export default function ManualInputPanel({ onCommand }) {
  const [command, setCommand] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (command.trim()) {
      onCommand(command.trim());
      setCommand("");
    }
  };

  const quickCommands = [
    "add tomato 2kg 50rs",
    "add rice 1kg 80rs",
    "remove tomato",
    "reset bill",
    "generate invoice",
    "total"
  ];

  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardContent className="p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
            <Keyboard className="text-white w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-blue-800">
              Manual Command Input
            </h3>
            <p className="text-sm text-blue-600">
              Type commands manually if voice isn't available
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="manual-command" className="text-blue-700">
              Enter Command
            </Label>
            <div className="flex space-x-2 mt-1">
              <Input
                id="manual-command"
                value={command}
                onChange={(e) => setCommand(e.target.value)}
                placeholder="Type a command like 'add tomato 2kg 50rs'"
                className="flex-1"
                data-testid="input-manual-command"
              />
              <Button
                type="submit"
                disabled={!command.trim()}
                className="bg-blue-500 hover:bg-blue-600"
                data-testid="button-send-command"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </form>

        <div className="mt-4">
          <Label className="text-blue-700 text-sm">Quick Commands:</Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
            {quickCommands.map((cmd, index) => (
              <Button
                key={index}
                onClick={() => onCommand(cmd)}
                variant="outline"
                size="sm"
                className="text-left justify-start text-blue-600 border-blue-300 hover:bg-blue-100"
                data-testid={`button-quick-${index}`}
              >
                {cmd}
              </Button>
            ))}
          </div>
        </div>

        <div className="mt-4 p-3 bg-white rounded border border-blue-200">
          <h4 className="font-medium text-blue-800 mb-2">Command Examples:</h4>
          <div className="text-sm text-blue-700 space-y-1">
            <p>
              <strong>Add items:</strong> "add [item] [quantity] [price]"
            </p>
            <p>
              <strong>Remove items:</strong> "remove [item]"
            </p>
            <p>
              <strong>Other commands:</strong> "reset bill", "total", "generate
              invoice"
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
