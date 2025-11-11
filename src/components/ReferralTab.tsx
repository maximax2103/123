import { Users, Copy, Gift, TrendingUp, Star, Loader2 } from "lucide-react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { toast } from "sonner@2.0.3";
import { useEffect, useState } from "react";
import { getReferralDetails } from "../lib/api";
import { useTelegram } from "../hooks/useTelegram";

interface Referral {
  id: number;
  name: string;
  earned: number;
  date: string;
}

interface ReferralTabProps {
  userId: number;
  userName: string;
}

export function ReferralTab({ userId, userName }: ReferralTabProps) {
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(true);
  const { hapticNotification } = useTelegram();
  
  const botUsername = "starsquestsbot";
  const referralLink = `https://t.me/${botUsername}?start=ref${userId}`;

  useEffect(() => {
    loadReferrals();
  }, [userId]);

  const loadReferrals = async () => {
    try {
      setLoading(true);
      const data = await getReferralDetails(userId);
      setReferrals(data);
    } catch (error) {
      console.error("Error loading referrals:", error);
      toast.error("Ошибка загрузки рефералов");
    } finally {
      setLoading(false);
    }
  };

  const totalReferrals = referrals.length;
  const totalEarned = referrals.reduce((sum, ref) => sum + ref.earned, 0);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    hapticNotification("success");
    toast.success("Ссылка скопирована!");
  };

  const handleShare = () => {
    const shareText = `Присоединяйся ко мне в ${botUsername}! Выполняй задания и зарабатывай Telegram Stars!`;
    const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent(shareText)}`;
    window.open(shareUrl, "_blank");
    hapticNotification("light");
  };

  return (
    <div className="space-y-4">
      <div>
        <h2>Реферальная система</h2>
        <p className="text-muted-foreground">
          Приглашайте друзей и получайте бонусы
        </p>
      </div>

      <Card className="p-4 bg-gradient-to-br from-purple-500/10 to-blue-500/10">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-purple-500/20">
            <Gift className="w-6 h-6 text-purple-500" />
          </div>
          <div>
            <h3 className="flex items-center justify-center gap-2">
              Получайте 500 <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 inline" /> stars
            </h3>
            <p className="text-muted-foreground">
              За каждого приглашенного друга
            </p>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-3">
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2 text-muted-foreground">
            <Users className="w-4 h-4" />
            <span>Рефералы</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl">{totalReferrals}</span>
            <span className="text-muted-foreground">друзей</span>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2 text-muted-foreground">
            <TrendingUp className="w-4 h-4" />
            <span>Заработано</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl">{totalEarned}</span>
            <span className="text-muted-foreground">stars</span>
          </div>
        </Card>
      </div>

      <Card className="p-4">
        <p className="mb-3">Ваша реферальная ссылка:</p>
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            value={referralLink}
            readOnly
            className="flex-1 px-3 py-2 bg-muted rounded-md truncate"
          />
          <Button onClick={handleCopyLink} size="icon">
            <Copy className="w-4 h-4" />
          </Button>
        </div>
        <Button onClick={handleShare} className="w-full" variant="outline">
          <Star className="w-4 h-4 mr-2 fill-yellow-400 text-yellow-400" />
          Поделиться в Telegram
        </Button>
      </Card>

      <div>
        <h3 className="mb-3">Ваши рефералы</h3>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : referrals.length > 0 ? (
          <div className="space-y-2">
            {referrals.map((referral) => (
              <Card key={referral.id} className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback>
                        {referral.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div>{referral.name}</div>
                      <div className="text-muted-foreground">
                        {referral.date}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-green-500">
                    <Star className="w-3 h-3 fill-green-500" />
                    <span>+{referral.earned}</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-6 text-center">
            <Users className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
            <p className="text-muted-foreground">
              Вы еще не пригласили друзей
            </p>
            <p className="text-muted-foreground mt-1">
              Поделитесь ссылкой и начните зарабатывать!
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}