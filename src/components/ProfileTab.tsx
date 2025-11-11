import { User, Star, Trophy, Calendar, Loader2 } from "lucide-react";
import { Card } from "./ui/card";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import { useEffect, useState } from "react";
import { getOrCreateUser } from "../lib/api";
import { UserData, calculateLevel } from "../lib/database.types";
import { TelegramUser } from "../lib/telegram";

interface ProfileTabProps {
  user: TelegramUser | null;
}

export function ProfileTab({ user }: ProfileTabProps) {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      loadUserData();
    }

    // Слушаем обновления баланса
    const handleBalanceUpdate = (event: CustomEvent) => {
      if (event.detail.balance !== undefined) {
        setUserData(prev => prev ? { ...prev, balance: event.detail.balance } : null);
      }
    };

    window.addEventListener("balanceUpdated", handleBalanceUpdate as EventListener);
    return () => {
      window.removeEventListener("balanceUpdated", handleBalanceUpdate as EventListener);
    };
  }, [user?.id]);

  const loadUserData = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const data = await getOrCreateUser(user.id, user.first_name, user.username);
      setUserData(data);
    } catch (error) {
      console.error("Error loading user data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !userData) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const { level, nextLevelExp, currentLevelExp } = calculateLevel(userData.experience);
  const progressPercent = ((userData.experience - currentLevelExp) / (nextLevelExp - currentLevelExp)) * 100;
  
  const daysActive = Math.floor(
    (new Date().getTime() - new Date(userData.created_at).getTime()) / (1000 * 60 * 60 * 24)
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ru-RU", { 
      day: "numeric", 
      month: "long", 
      year: "numeric" 
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <h2>Профиль</h2>
        <p className="text-muted-foreground">
          Ваша статистика и достижения
        </p>
      </div>

      <Card className="p-6">
        <div className="flex flex-col items-center text-center space-y-4">
          <Avatar className="w-20 h-20">
            <AvatarFallback className="text-2xl">
              {user?.photo_url ? (
                <img src={user.photo_url} alt={userData.first_name} />
              ) : (
                <User className="w-10 h-10" />
              )}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3>{user?.first_name || userData.first_name}</h3>
            <p className="text-muted-foreground">
              {user?.username ? `@${user.username}` : (userData.username ? `@${userData.username}` : `ID: ${userData.user_id}`)}
            </p>
          </div>
          <div className="w-full space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Уровень {level}</span>
              <span className="text-muted-foreground">
                {userData.experience - currentLevelExp}/{nextLevelExp - currentLevelExp} XP
              </span>
            </div>
            <Progress value={progressPercent} />
          </div>
        </div>
      </Card>

      <Card className="p-4 bg-gradient-to-br from-yellow-500/10 to-orange-500/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center">
              <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
            </div>
            <div>
              <div className="text-muted-foreground">Баланс</div>
              <div className="text-2xl">{userData.balance} stars</div>
            </div>
          </div>
          <Button variant="outline" disabled>
            Скоро
          </Button>
        </div>
      </Card>

      <div className="grid grid-cols-3 gap-3">
        <Card className="p-4 text-center">
          <Trophy className="w-6 h-6 mx-auto mb-2 text-purple-500" />
          <div className="text-2xl">{userData.tasks_completed}</div>
          <div className="text-muted-foreground">Заданий</div>
        </Card>
        <Card className="p-4 text-center">
          <User className="w-6 h-6 mx-auto mb-2 text-blue-500" />
          <div className="text-2xl">{userData.referrals_count}</div>
          <div className="text-muted-foreground">Рефералов</div>
        </Card>
        <Card className="p-4 text-center">
          <Calendar className="w-6 h-6 mx-auto mb-2 text-green-500" />
          <div className="text-2xl">{daysActive}</div>
          <div className="text-muted-foreground">Дней</div>
        </Card>
      </div>

      <Card className="p-4">
        <h3 className="mb-3">Информация</h3>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Дата регистрации</span>
            <span>{formatDate(userData.created_at)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">В приложении</span>
            <span>{daysActive} {daysActive === 1 ? "день" : "дней"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Текущий уровень</span>
            <span>Уровень {level}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Всего опыта</span>
            <span>{userData.experience} XP</span>
          </div>
        </div>
      </Card>

    </div>
  );
}
