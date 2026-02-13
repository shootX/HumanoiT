<?php

namespace App\Listeners;

use App\Events\GoogleMeetingCreated;
use App\Services\EmailTemplateService;
use Exception;

class SendGoogleMeetingNotificationEmail
{
    public function __construct(
        private EmailTemplateService $emailService,
    ) {
    }

    public function handle(GoogleMeetingCreated $event): void
    {
        if (!emailNotificationEnabled()) {
            return;
        }

        $meeting = $event->meeting;
        $meeting->load(['project', 'user', 'members']);

        if (isEmailTemplateEnabled('Google Meeting Notification', createdBy())) {
            foreach ($meeting->members as $member) {
                if (!$member->email) {
                    continue;
                }

                $variables = [
                    '{member_name}' => $member->name,
                    '{meeting_title}' => $meeting->title,
                    '{project_name}' => $meeting->project->title ?? 'N/A',
                    '{start_time}' => $meeting->start_time->format('Y-m-d H:i:s'),
                    '{duration}' => $meeting->duration,
                    '{organizer_name}' => $meeting->user->name,
                    '{meeting_description}' => $meeting->description ?? '',
                    '{join_url}' => $meeting->join_url ?? '',
                    '{app_name}' => config('app.name')
                ];

                try {
                    $userLanguage = $member->lang ?? 'en';

                    $this->emailService->sendTemplateEmailWithLanguage(
                        templateName: 'Google Meeting Notification',
                        variables: $variables,
                        toEmail: $member->email,
                        toName: $member->name,
                        language: $userLanguage
                    );
                    session()->flash('success', 'Google Meeting email sent successfully');

                } catch (Exception $e) {
                    \Log::error('Google meeting notification email failed: ' . $e->getMessage(), [
                        'meeting_id' => $meeting->id,
                        'member_email' => $member->email
                    ]);
                    session()->flash('error', 'Failed to send Google meeting notification email');
                }
            }
        }
    }
}