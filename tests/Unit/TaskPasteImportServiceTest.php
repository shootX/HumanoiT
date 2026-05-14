<?php

use App\Services\TaskPasteImportService;
use Illuminate\Validation\ValidationException;

uses(Tests\TestCase::class);

test('parses first line as branch and numbered list', function () {
    $svc = new TaskPasteImportService();
    $r = $svc->parse("ვარკეთილის ფილიალი:\n1. რემონტი\n2. სანტექნიკა\n");
    expect($r['branch'])->toBe('ვარკეთილის ფილიალი');
    expect($r['titles'])->toBe(['რემონტი', 'სანტექნიკა']);
    expect($r['skipped_duplicates'])->toBe(0);
});

test('parses parenthesis numbering in body', function () {
    $svc = new TaskPasteImportService();
    $r = $svc->parse("ტესტი:\n1) ერთი\n2) ორი\n");
    expect($r['branch'])->toBe('ტესტი');
    expect($r['titles'])->toBe(['ერთი', 'ორი']);
});

test('strips trailing colon from first line', function () {
    $svc = new TaskPasteImportService();
    $r = $svc->parse("სახელი  \t:\n1. a\n");
    expect($r['branch'])->toBe('სახელი');
});

test('dedupes titles case and whitespace insensitive', function () {
    $svc = new TaskPasteImportService();
    $r = $svc->parse("X:\n1. Task\n2.  task \n3. Other\n");
    expect($r['titles'])->toBe(['Task', 'Other']);
    expect($r['skipped_duplicates'])->toBe(1);
});

test('parses plain body lines when no numbering', function () {
    $svc = new TaskPasteImportService();
    $r = $svc->parse("ბრენჩი:\nპირველი\nმეორე\n");
    expect($r['branch'])->toBe('ბრენჩი');
    expect($r['titles'])->toBe(['პირველი', 'მეორე']);
});

test('parses bullet lines in body', function () {
    $svc = new TaskPasteImportService();
    $r = $svc->parse("X:
- ერთი
* ორი
");
    expect($r['titles'])->toBe(['ერთი', 'ორი']);
});

test('prefers numbered lines in body when mixed', function () {
    $svc = new TaskPasteImportService();
    $r = $svc->parse("H:\n1. Only\n- Bullet\n");
    expect($r['titles'])->toBe(['Only']);
});

test('throws when pasted text is empty', function () {
    $svc = new TaskPasteImportService();
    $svc->parse("   \n  \n  ");
})->throws(ValidationException::class);

test('throws when first line has no branch', function () {
    $svc = new TaskPasteImportService();
    $svc->parse(":\n1. a\n");
})->throws(ValidationException::class);

test('throws when title exceeds 255 characters', function () {
    $svc = new TaskPasteImportService();
    $long = str_repeat('ა', 256);
    $svc->parse("H:\n1. {$long}\n");
})->throws(ValidationException::class);

test('throws when branch exceeds 255 characters', function () {
    $svc = new TaskPasteImportService();
    $long = str_repeat('ბ', 256);
    $svc->parse("{$long}:\n1. a\n");
})->throws(ValidationException::class);
