<x-mail::message>
# You're Invited to Velora

Hi there!

**{{ $inviterName }}** has invited you to join Velora as a **{{ $roleName }}**.

<x-mail::button :url="$invitationUrl">
Accept Invitation
</x-mail::button>

This invitation will expire on **{{ $expiresAt }}**.

If you didn't expect this invitation, you can safely ignore this email.

Thanks,<br>
{{ config('app.name') }}
</x-mail::message>
