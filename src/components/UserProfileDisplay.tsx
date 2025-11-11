import React from 'react';
import { UserData } from '../lib/database.types';
import { TelegramUser } from '../lib/telegram';
import { Card } from './ui/card';
import { Star } from 'lucide-react';

interface UserProfileDisplayProps {
  user: TelegramUser | null;
  userData: UserData | null;
}

export function UserProfileDisplay({ user, userData }: UserProfileDisplayProps) {
  const displayName = user?.first_name || userData?.first_name || 'Пользователь';
  const displayUsername = user?.username || userData?.username || '';
  const displayBalance = userData?.balance || 0;

  return (
    <Card className="p-4 mb-4 flex items-center justify-between">
      <div>
        <h3 className="text-lg font-semibold">Привет, {displayName}!</h3>
        {displayUsername && <p className="text-muted-foreground text-sm">@{displayUsername}</p>}
      </div>
      <div className="flex items-center gap-1 text-yellow-400">
        <Star className="w-5 h-5 fill-yellow-400" />
        <span className="text-xl font-bold">{displayBalance}</span>
      </div>
    </Card>
  );
}
