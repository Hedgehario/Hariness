-- Migration: Initial Schema
-- Description: Create all tables, RLS policies, and triggers based on ER diagram.

-- ============================================================
-- 1. USERS (ユーザー)
-- ============================================================
CREATE TABLE public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    display_name TEXT NOT NULL,
    avatar_url TEXT,
    gender TEXT, -- 'male', 'female', 'unknown'
    age_group TEXT, -- '10s', '20s', '30s', '40s', '50s', '60_over'
    prefecture TEXT,
    role TEXT NOT NULL DEFAULT 'user', -- 'user', 'admin'
    is_push_enabled BOOLEAN NOT NULL DEFAULT true,
    is_reminder_notification_enabled BOOLEAN NOT NULL DEFAULT true,
    is_alert_notification_enabled BOOLEAN NOT NULL DEFAULT true,
    is_news_notification_enabled BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    last_login_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own profile" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.users FOR UPDATE USING (auth.uid() = id);
-- Note: Insert is handled by trigger usually, but allowing for now if needed from client (though trigger is better)
CREATE POLICY "Users can insert their own profile" ON public.users FOR INSERT WITH CHECK (auth.uid() = id);

-- Trigger to handle updated_at
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_users_updated
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- Trigger to create profile on signup (Optional but recommended)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, display_name)
  VALUES (new.id, new.email, split_part(new.email, '@', 1));
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();


-- ============================================================
-- 2. HEDGEHOGS (個体)
-- ============================================================
CREATE TABLE public.hedgehogs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    gender TEXT, -- 'male', 'female', 'unknown'
    birth_date DATE,
    welcome_date DATE,
    image_url TEXT,
    features TEXT,
    insurance_number TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_hedgehogs_user_id ON public.hedgehogs(user_id);

-- Enable RLS
ALTER TABLE public.hedgehogs ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own hedgehogs" ON public.hedgehogs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own hedgehogs" ON public.hedgehogs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own hedgehogs" ON public.hedgehogs FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own hedgehogs" ON public.hedgehogs FOR DELETE USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER on_hedgehogs_updated
  BEFORE UPDATE ON public.hedgehogs
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();


-- ============================================================
-- 3. WEIGHT_RECORDS (体重記録)
-- ============================================================
CREATE TABLE public.weight_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hedgehog_id UUID NOT NULL REFERENCES public.hedgehogs(id) ON DELETE CASCADE,
    weight INTEGER NOT NULL,
    record_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(hedgehog_id, record_date) -- 1日1回制限
);

-- Indexes
CREATE INDEX idx_weight_records_hedgehog_id ON public.weight_records(hedgehog_id);
CREATE INDEX idx_weight_records_record_date ON public.weight_records(record_date);

-- Enable RLS
ALTER TABLE public.weight_records ENABLE ROW LEVEL SECURITY;

-- Policies (Via hedgehog_id -> user_id check)
CREATE POLICY "Users can manage records of their hedgehogs" ON public.weight_records
    USING (EXISTS (SELECT 1 FROM public.hedgehogs WHERE id = weight_records.hedgehog_id AND user_id = auth.uid()));


-- ============================================================
-- 4. MEAL_RECORDS (食事記録)
-- ============================================================
CREATE TABLE public.meal_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hedgehog_id UUID NOT NULL REFERENCES public.hedgehogs(id) ON DELETE CASCADE,
    record_date DATE NOT NULL,
    record_time TIME NOT NULL,
    content TEXT NOT NULL,
    amount DECIMAL,
    amount_unit TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_meal_records_hedgehog_id ON public.meal_records(hedgehog_id);
CREATE INDEX idx_meal_records_record_date ON public.meal_records(record_date);

ALTER TABLE public.meal_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage records of their hedgehogs" ON public.meal_records
    USING (EXISTS (SELECT 1 FROM public.hedgehogs WHERE id = meal_records.hedgehog_id AND user_id = auth.uid()));


-- ============================================================
-- 5. EXCRETION_RECORDS (排泄記録)
-- ============================================================
CREATE TABLE public.excretion_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hedgehog_id UUID NOT NULL REFERENCES public.hedgehogs(id) ON DELETE CASCADE,
    record_date DATE NOT NULL,
    record_time TIME NOT NULL,
    condition TEXT NOT NULL, -- 'normal', 'abnormal'
    details TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_excretion_records_hedgehog_id ON public.excretion_records(hedgehog_id);
CREATE INDEX idx_excretion_records_record_date ON public.excretion_records(record_date);

ALTER TABLE public.excretion_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage records of their hedgehogs" ON public.excretion_records
    USING (EXISTS (SELECT 1 FROM public.hedgehogs WHERE id = excretion_records.hedgehog_id AND user_id = auth.uid()));


-- ============================================================
-- 6. ENVIRONMENT_RECORDS (環境記録)
-- ============================================================
CREATE TABLE public.environment_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hedgehog_id UUID NOT NULL REFERENCES public.hedgehogs(id) ON DELETE CASCADE,
    record_date DATE NOT NULL,
    temperature DECIMAL,
    humidity DECIMAL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(hedgehog_id, record_date), -- 1日1回制限
    CONSTRAINT temperature_or_humidity_required CHECK (temperature IS NOT NULL OR humidity IS NOT NULL)
);

CREATE INDEX idx_environment_records_hedgehog_id ON public.environment_records(hedgehog_id);
CREATE INDEX idx_environment_records_record_date ON public.environment_records(record_date);

ALTER TABLE public.environment_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage records of their hedgehogs" ON public.environment_records
    USING (EXISTS (SELECT 1 FROM public.hedgehogs WHERE id = environment_records.hedgehog_id AND user_id = auth.uid()));


-- ============================================================
-- 7. MEDICATION_RECORDS (投薬記録)
-- ============================================================
CREATE TABLE public.medication_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hedgehog_id UUID NOT NULL REFERENCES public.hedgehogs(id) ON DELETE CASCADE,
    record_date DATE NOT NULL,
    record_time TIME NOT NULL,
    medicine_name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_medication_records_hedgehog_id ON public.medication_records(hedgehog_id);
CREATE INDEX idx_medication_records_record_date ON public.medication_records(record_date);

ALTER TABLE public.medication_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage records of their hedgehogs" ON public.medication_records
    USING (EXISTS (SELECT 1 FROM public.hedgehogs WHERE id = medication_records.hedgehog_id AND user_id = auth.uid()));


-- ============================================================
-- 8. MEMO_RECORDS (メモ記録)
-- ============================================================
CREATE TABLE public.memo_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hedgehog_id UUID NOT NULL REFERENCES public.hedgehogs(id) ON DELETE CASCADE,
    record_date DATE NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_memo_records_hedgehog_id ON public.memo_records(hedgehog_id);
CREATE INDEX idx_memo_records_record_date ON public.memo_records(record_date);

ALTER TABLE public.memo_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage records of their hedgehogs" ON public.memo_records
    USING (EXISTS (SELECT 1 FROM public.hedgehogs WHERE id = memo_records.hedgehog_id AND user_id = auth.uid()));


-- ============================================================
-- 9. HOSPITAL_VISITS (通院記録)
-- ============================================================
CREATE TABLE public.hospital_visits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hedgehog_id UUID NOT NULL REFERENCES public.hedgehogs(id) ON DELETE CASCADE,
    visit_date DATE NOT NULL,
    diagnosis TEXT,
    treatment TEXT,
    medicine_prescription JSONB, -- [{name: string, note: string}]
    next_visit_date DATE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_hospital_visits_hedgehog_id ON public.hospital_visits(hedgehog_id);
CREATE INDEX idx_hospital_visits_visit_date ON public.hospital_visits(visit_date);

ALTER TABLE public.hospital_visits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage records of their hedgehogs" ON public.hospital_visits
    USING (EXISTS (SELECT 1 FROM public.hedgehogs WHERE id = hospital_visits.hedgehog_id AND user_id = auth.uid()));


-- ============================================================
-- 10. CARE_REMINDERS (お世話リマインダー)
-- ============================================================
CREATE TABLE public.care_reminders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    target_time TIME NOT NULL,
    is_repeat BOOLEAN NOT NULL DEFAULT false,
    frequency TEXT, -- 'daily', 'weekly'
    days_of_week TEXT, -- 'Mon,Wed'
    is_enabled BOOLEAN NOT NULL DEFAULT true,
    last_completed_date DATE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_care_reminders_user_id ON public.care_reminders(user_id);

ALTER TABLE public.care_reminders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own reminders" ON public.care_reminders FOR ALL USING (auth.uid() = user_id);


-- ============================================================
-- 11. CALENDAR_EVENTS (カレンダーイベント)
-- ============================================================
CREATE TABLE public.calendar_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    event_date DATE NOT NULL,
    title TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_calendar_events_user_id ON public.calendar_events(user_id);
CREATE INDEX idx_calendar_events_event_date ON public.calendar_events(event_date);

ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own events" ON public.calendar_events FOR ALL USING (auth.uid() = user_id);


-- ============================================================
-- 12. NEWS (お知らせ)
-- ============================================================
CREATE TABLE public.news (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    is_published BOOLEAN NOT NULL DEFAULT false,
    published_at TIMESTAMP WITH TIME ZONE,
    created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_news_published_at ON public.news(published_at);

ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;

-- Admins can manage news (TODO: Add admin check later if role based access is strict in RLS)
-- For now, read-only for public if published
CREATE POLICY "Public can view published news" ON public.news FOR SELECT USING (is_published = true);


-- ============================================================
-- 13. NEWS_READ_STATUS (お知らせ既読状況)
-- ============================================================
CREATE TABLE public.news_read_status (
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    news_id UUID NOT NULL REFERENCES public.news(id) ON DELETE CASCADE,
    read_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    PRIMARY KEY (user_id, news_id)
);

ALTER TABLE public.news_read_status ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own read status" ON public.news_read_status FOR ALL USING (auth.uid() = user_id);


-- ============================================================
-- 14. ALERT_HISTORY (アラート履歴)
-- ============================================================
CREATE TABLE public.alert_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    hedgehog_id UUID REFERENCES public.hedgehogs(id) ON DELETE SET NULL,
    alert_type TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_alert_history_user_id ON public.alert_history(user_id);

ALTER TABLE public.alert_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own alerts" ON public.alert_history FOR ALL USING (auth.uid() = user_id);


-- ============================================================
-- 15. WITHDRAWAL_LOGS (退会ログ)
-- ============================================================
CREATE TABLE public.withdrawal_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL, -- Logical link only
    email_hash TEXT NOT NULL,
    reason TEXT,
    withdrawn_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    age_group TEXT,
    gender TEXT,
    prefecture TEXT,
    hedgehog_count INTEGER,
    days_used INTEGER
);

-- No RLS needed as this is system log, but good practice to enable and restrict
ALTER TABLE public.withdrawal_logs ENABLE ROW LEVEL SECURITY;
-- Only admin or system can access (No public policy)

