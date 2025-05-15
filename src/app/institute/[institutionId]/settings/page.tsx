'use client';

import { trpc } from '@/utils/trpc';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SettingsPage({ params }: { params: { institutionId: string } }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: institution, isLoading } = trpc.institution.get.useQuery({
    institutionId: params.institutionId,
  });

  const updateSettings = trpc.institution.updateSettings.useMutation({
    onSuccess: () => {
      router.refresh();
      setIsSubmitting(false);
    },
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    try {
      await updateSettings.mutateAsync({
        institutionId: params.institutionId,
        settings: {
          name: formData.get('name') as string,
          email: formData.get('email') as string,
          autoSendTranscripts: formData.get('autoSendTranscripts') === 'true',
          transcriptEmailTemplate: formData.get('transcriptEmailTemplate') as string,
          gradeReleasePolicy: formData.get('gradeReleasePolicy') as 'immediate' | 'manual' | 'scheduled',
          gradeReleaseSchedule: formData.get('gradeReleaseSchedule') as string,
          allowStudentRegistration: formData.get('allowStudentRegistration') === 'true',
          requireTeacherApproval: formData.get('requireTeacherApproval') === 'true',
          notificationPreferences: {
            email: formData.get('notifyEmail') === 'true',
            push: formData.get('notifyPush') === 'true',
            gradeUpdates: formData.get('notifyGrades') === 'true',
            assignmentUpdates: formData.get('notifyAssignments') === 'true',
            announcementUpdates: formData.get('notifyAnnouncements') === 'true',
          },
          securitySettings: {
            requireTwoFactor: formData.get('requireTwoFactor') === 'true',
            sessionTimeout: parseInt(formData.get('sessionTimeout') as string),
            passwordPolicy: {
              minLength: parseInt(formData.get('passwordMinLength') as string),
              requireSpecialChar: formData.get('requireSpecialChar') === 'true',
              requireNumbers: formData.get('requireNumbers') === 'true',
            },
          },
        },
      });
    } catch (error) {
      console.error('Error updating settings:', error);
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-8">Institution Settings</h1>

      <form onSubmit={handleSubmit} className="space-y-8">
        <Card>
          <h2 className="text-xl font-semibold mb-4">General Settings</h2>
          <div className="space-y-4">
            <Input.Text
              label="Institution Name"
              name="name"
              defaultValue={institution?.name}
              required
            />
            <Input.Text
              label="Contact Email"
              name="email"
              type="email"
              defaultValue={institution?.settings?.email}
            />
          </div>
        </Card>

        <Card>
          <h2 className="text-xl font-semibold mb-4">Grade Management</h2>
          <div className="space-y-4">
            <Input.Checkbox
              label="Automatically Send Transcripts"
              name="autoSendTranscripts"
              defaultChecked={institution?.settings?.autoSendTranscripts}
            />
            <Input.Textarea
              label="Transcript Email Template"
              name="transcriptEmailTemplate"
              defaultValue={institution?.settings?.transcriptEmailTemplate}
              rows={4}
            />
            <Input.Select
              label="Grade Release Policy"
              name="gradeReleasePolicy"
              defaultValue={institution?.settings?.gradeReleasePolicy}
              options={[
                { value: 'immediate', label: 'Immediate' },
                { value: 'manual', label: 'Manual Approval' },
                { value: 'scheduled', label: 'Scheduled Release' },
              ]}
            />
            <Input.Text
              label="Grade Release Schedule (Cron Expression)"
              name="gradeReleaseSchedule"
              defaultValue={institution?.settings?.gradeReleaseSchedule}
            />
          </div>
        </Card>

        <Card>
          <h2 className="text-xl font-semibold mb-4">Registration Settings</h2>
          <div className="space-y-4">
            <Input.Checkbox
              label="Allow Student Self-Registration"
              name="allowStudentRegistration"
              defaultChecked={institution?.settings?.allowStudentRegistration}
            />
            <Input.Checkbox
              label="Require Teacher Approval"
              name="requireTeacherApproval"
              defaultChecked={institution?.settings?.requireTeacherApproval}
            />
          </div>
        </Card>

        <Card>
          <h2 className="text-xl font-semibold mb-4">Notification Preferences</h2>
          <div className="space-y-4">
            <Input.Checkbox
              label="Email Notifications"
              name="notifyEmail"
              defaultChecked={institution?.settings?.notificationPreferences?.email}
            />
            <Input.Checkbox
              label="Push Notifications"
              name="notifyPush"
              defaultChecked={institution?.settings?.notificationPreferences?.push}
            />
            <Input.Checkbox
              label="Grade Updates"
              name="notifyGrades"
              defaultChecked={institution?.settings?.notificationPreferences?.gradeUpdates}
            />
            <Input.Checkbox
              label="Assignment Updates"
              name="notifyAssignments"
              defaultChecked={institution?.settings?.notificationPreferences?.assignmentUpdates}
            />
            <Input.Checkbox
              label="Announcement Updates"
              name="notifyAnnouncements"
              defaultChecked={institution?.settings?.notificationPreferences?.announcementUpdates}
            />
          </div>
        </Card>

        <Card>
          <h2 className="text-xl font-semibold mb-4">Security Settings</h2>
          <div className="space-y-4">
            <Input.Checkbox
              label="Require Two-Factor Authentication"
              name="requireTwoFactor"
              defaultChecked={institution?.settings?.securitySettings?.requireTwoFactor}
            />
            <Input.Text
              label="Session Timeout (minutes)"
              name="sessionTimeout"
              type="number"
              min="5"
              max="1440"
              defaultValue={institution?.settings?.securitySettings?.sessionTimeout}
            />
            <div className="space-y-2">
              <h3 className="font-medium">Password Policy</h3>
              <Input.Text
                label="Minimum Length"
                name="passwordMinLength"
                type="number"
                min="8"
                max="32"
                defaultValue={institution?.settings?.securitySettings?.passwordPolicy?.minLength}
              />
              <Input.Checkbox
                label="Require Special Characters"
                name="requireSpecialChar"
                defaultChecked={institution?.settings?.securitySettings?.passwordPolicy?.requireSpecialChar}
              />
              <Input.Checkbox
                label="Require Numbers"
                name="requireNumbers"
                defaultChecked={institution?.settings?.securitySettings?.passwordPolicy?.requireNumbers}
              />
            </div>
          </div>
        </Card>

        <div className="flex justify-end">
          <Button.Primary type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save Settings'}
          </Button.Primary>
        </div>
      </form>
    </div>
  );
} 