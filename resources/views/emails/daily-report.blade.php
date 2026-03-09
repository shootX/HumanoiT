@extends('emails.layout')

@section('title', config('app.name') . ' - ყოველდღიური რეპორტი')

@section('content')
<div style="padding: 15px 0;">
    <h2 style="margin: 0 0 20px 0; color: #333;">ყოველდღიური რეპორტი — {{ $date }}</h2>

    <h3 style="margin: 20px 0 10px 0; color: #3B82F6;">✅ შესრულებული დავალებები ({{ $completedTasks->count() }})</h3>
    @if($completedTasks->isEmpty())
        <p style="color: #666;">დღეს არ არის შესრულებული დავალებები.</p>
    @else
        <ul style="margin: 0; padding-left: 20px;">
            @foreach($completedTasks as $t)
                <li style="margin-bottom: 5px;">
                    <strong>{{ $t->title }}</strong>
                    @if($t->project) — {{ $t->project->title }} @endif
                    @if($t->assignedTo) ({{ $t->assignedTo->name }}) @endif
                </li>
            @endforeach
        </ul>
    @endif

    <h3 style="margin: 25px 0 10px 0; color: #10B981;">➕ რა დაგვემატა</h3>

    <p style="margin: 5px 0;"><strong>ახალი დავალებები ({{ $newTasks->count() }}):</strong></p>
    @if($newTasks->isEmpty())
        <p style="color: #666; margin-left: 15px;">—</p>
    @else
        <ul style="margin: 0 0 15px 0; padding-left: 20px;">
            @foreach($newTasks as $t)
                <li style="margin-bottom: 5px;">{{ $t->title }} @if($t->project) — {{ $t->project->title }} @endif</li>
            @endforeach
        </ul>
    @endif

    <p style="margin: 5px 0;"><strong>ახალი აქტივები ({{ $newAssets->count() }}):</strong></p>
    @if($newAssets->isEmpty())
        <p style="color: #666; margin-left: 15px;">—</p>
    @else
        <ul style="margin: 0 0 15px 0; padding-left: 20px;">
            @foreach($newAssets as $a)
                <li style="margin-bottom: 5px;">{{ $a->name }} @if($a->asset_code) ({{ $a->asset_code }}) @endif @if($a->project) — {{ $a->project->title }} @endif</li>
            @endforeach
        </ul>
    @endif

    <p style="margin: 5px 0;"><strong>ახალი ტექნიკა ({{ $newEquipment->count() }}):</strong></p>
    @if($newEquipment->isEmpty())
        <p style="color: #666; margin-left: 15px;">—</p>
    @else
        <ul style="margin: 0 0 15px 0; padding-left: 20px;">
            @foreach($newEquipment as $e)
                <li style="margin-bottom: 5px;">{{ $e->name }} @if($e->code) ({{ $e->code }}) @endif @if($e->project) — {{ $e->project->title }} @endif</li>
            @endforeach
        </ul>
    @endif

    <h3 style="margin: 25px 0 10px 0; color: #F59E0B;">🛒 რა შევიძინეთ / ხარჯები</h3>
    @if($expenses->isEmpty())
        <p style="color: #666;">დღეს არ არის ჩაწერილი ხარჯები.</p>
    @else
        <ul style="margin: 0; padding-left: 20px;">
            @foreach($expenses as $e)
                <li style="margin-bottom: 8px;">
                    <strong>{{ $e->title }}</strong> — {{ number_format($e->amount, 2) }} {{ $e->currency ?? 'GEL' }}
                    @if($e->project) ({{ $e->project->title }}) @endif
                    @if($e->budgetCategory) [{{ $e->budgetCategory->name }}] @endif
                </li>
            @endforeach
        </ul>
    @endif

    <h3 style="margin: 25px 0 10px 0; color: #EF4444;">💰 სულ დახარჯული: {{ number_format($totalSpent, 2) }} GEL</h3>
</div>
@endsection
