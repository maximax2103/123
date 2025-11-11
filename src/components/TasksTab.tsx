import { CheckCircle2, Circle, Star, Loader2 } from "lucide-react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { useState, useEffect } from "react";
import { getTasks, getUserTasks, completeTask } from "../lib/api";
import { TaskData, UserTask } from "../lib/database.types";
import { toast } from "sonner@2.0.3";
import { useTelegram } from "../hooks/useTelegram";

interface Task extends TaskData {
  completed: boolean;
}

interface TasksTabProps {
  userId: number;
}

export function TasksTab({ userId }: TasksTabProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [completingTask, setCompletingTask] = useState<number | null>(null);
  const { hapticNotification, openTelegramLink } = useTelegram();

  useEffect(() => {
    loadTasks();
  }, [userId]);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const [allTasks, userTasksMap] = await Promise.all([
        getTasks(),
        getUserTasks(userId),
      ]);

      const tasksWithStatus = allTasks.map((task) => ({
        ...task,
        completed: userTasksMap.get(task.id)?.completed || false,
      }));

      setTasks(tasksWithStatus);
    } catch (error) {
      console.error("Error loading tasks:", error);
      toast.error("Ошибка загрузки заданий");
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteTask = async (task: Task) => {
    if (completingTask) return;

    try {
      setCompletingTask(task.id);

      // Если есть action_url, открываем ссылку
      if (task.action_url) {
        try {
          const url = new URL(task.action_url);
          if (url.protocol === 'http:' || url.protocol === 'https:') {
            openTelegramLink(task.action_url);
            // Даем пользователю время выполнить действие
            await new Promise(resolve => setTimeout(resolve, 2000));
          } else {
            console.warn('Blocked opening of unsafe URL protocol:', task.action_url);
            toast.error('Небезопасный URL-адрес задания');
          }
        } catch (e) {
          console.error('Invalid URL for task:', task.action_url, e);
          toast.error('Недействительный URL-адрес задания');
        }
      }

      const result = await completeTask(userId, task.id);

      if (result.success) {
        hapticNotification("success");
        toast.success(`Получено ${result.reward} stars!`, {
          description: `Задание "${task.title}" выполнено`,
        });

        // Обновляем список заданий
        setTasks(tasks.map((t) =>
          t.id === task.id ? { ...t, completed: true } : t
        ));

        // Можно также обновить баланс в профиле
        window.dispatchEvent(new CustomEvent("balanceUpdated", { 
          detail: { balance: result.user?.balance } 
        }));
      } else {
        toast.error("Не удалось выполнить задание");
      }
    } catch (error) {
      console.error("Error completing task:", error);
      toast.error("Ошибка при выполнении задания");
    } finally {
      setCompletingTask(null);
    }
  };

  const getTaskTypeColor = (type: string) => {
    switch (type) {
      case "social":
        return "bg-blue-500/10 text-blue-500";
      case "daily":
        return "bg-green-500/10 text-green-500";
      case "special":
        return "bg-purple-500/10 text-purple-500";
      default:
        return "bg-gray-500/10 text-gray-500";
    }
  };

  const getTaskTypeLabel = (type: string) => {
    switch (type) {
      case "social":
        return "Соц. сети";
      case "daily":
        return "Ежедневно";
      case "special":
        return "Специальное";
      default:
        return type;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2>Задания</h2>
          <p className="text-muted-foreground">
            Выполняйте задания и получайте награды
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {tasks.map((task) => (
          <Card key={task.id} className="p-4">
            <div className="flex items-start gap-3">
              <div className="mt-1">
                {task.completed ? (
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                ) : (
                  <Circle className="w-5 h-5 text-gray-400" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h3 className="truncate">{task.title}</h3>
                  <Badge className={getTaskTypeColor(task.type)} variant="secondary">
                    {getTaskTypeLabel(task.type)}
                  </Badge>
                </div>
                <p className="text-muted-foreground mb-3">{task.description}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-yellow-400">
                    <Star className="w-4 h-4 fill-yellow-400" />
                    <span>{task.reward} stars</span>
                  </div>
                  {!task.completed ? (
                    <Button
                      size="sm"
                      onClick={() => handleCompleteTask(task)}
                      disabled={completingTask === task.id}
                    >
                      {completingTask === task.id ? (
                        <>
                          <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                          Проверка...
                        </>
                      ) : (
                        "Выполнить"
                      )}
                    </Button>
                  ) : (
                    <span className="text-green-500">Выполнено</span>
                  )}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card className="p-4 text-center mt-4">
        <p className="text-muted-foreground mb-3">
          Хотите добавить свое задание?
        </p>
        <Button onClick={() => openTelegramLink("https://t.me/maximkuzeev")}>
          Связаться с менеджером
        </Button>
      </Card>
    </div>
  );
}
