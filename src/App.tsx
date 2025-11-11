import { useState, useEffect } from "react";
import { ListTodo, Users } from "lucide-react";
import { TasksTab } from "./components/TasksTab";
import { ReferralTab } from "./components/ReferralTab";
import { UserProfileDisplay } from "./components/UserProfileDisplay";
import { Toaster } from "./components/ui/sonner";
import { useTelegram } from "./hooks/useTelegram";
import { initializeApp, processReferral, getOrCreateUser } from "./lib/api";
import { UserData } from "./lib/database.types";
import { toast } from "sonner@2.0.3";

export default function App() {
  const [activeTab, setActiveTab] = useState<"tasks" | "referrals">("tasks");
  const { user, isLoading, hapticFeedback, startParam } = useTelegram();
  const [initialized, setInitialized] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
        await initializeApp();
        
        if (user?.id && telegram.isAvailable()) {
          const fetchedUserData = await getOrCreateUser(user.id, user.first_name, user.username);
          setUserData(fetchedUserData);
          
          if (startParam && startParam.startsWith("ref")) {
            const referrerId = parseInt(startParam.substring(3));
            if (referrerId && referrerId !== user.id) {
              const success = await processReferral(referrerId, user.id);
              if (success) {
                toast.success("Вы присоединились по реферальной ссылке!", {
                  description: "Ваш друг получил бонус!",
                });
              }
            }
          }
        }
        
        setInitialized(true);
      } catch (error) {
        console.error("Error initializing app:", error);
        setInitialized(true);
      }
    };

    if (!isLoading) {
      init();
    }
  }, [isLoading, user, startParam]);

  const handleTabChange = (tab: "tasks" | "referrals") => {
    hapticFeedback("light");
    setActiveTab(tab);
  };

  if (isLoading || !initialized) {
    return (
      <div className="dark min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Загрузка...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dark min-h-screen bg-background flex flex-col">
      <Toaster />
      
      {/* Main Content */}
      <div className="flex-1 overflow-y-auto pb-20">
        <div className="max-w-2xl mx-auto p-4">
          {/* User Profile Display */}
          <UserProfileDisplay user={user} userData={userData} />

          {activeTab === "tasks" && <TasksTab userId={user?.id || 0} />}
          {activeTab === "referrals" && <ReferralTab userId={user?.id || 0} userName={user?.first_name || "User"} />}
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t">
        <div className="max-w-2xl mx-auto">
          <div className="grid grid-cols-2">
            <button
              onClick={() => handleTabChange("tasks")}
              className={`flex flex-col items-center gap-1 py-3 transition-colors ${
                activeTab === "tasks"
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <ListTodo className="w-6 h-6" />
              <span className="text-xs">Задания</span>
            </button>
            <button
              onClick={() => handleTabChange("referrals")}
              className={`flex flex-col items-center gap-1 py-3 transition-colors ${
                activeTab === "referrals"
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Users className="w-6 h-6" />
              <span className="text-xs">Рефералы</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
