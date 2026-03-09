<?php

namespace Database\Seeders;

use App\Models\Project;
use Illuminate\Database\Seeder;

class HumanaProjectsSeeder extends Seeder
{
    public function run(): void
    {
        $workspaceId = 2;
        $createdBy = 3;

        $projects = [
            ['სათაო ოფისი', 'აღმაშენებლის გამზირი 50'],
            ['პლეხანოვის ფილიალი', 'აღმაშენებლის გამზირი 51'],
            ['ისანის ფილიალი', 'ისანი ნავთლუღის 6ა'],
            ['პუშკინის ფილიალი', 'პუშკინის 9'],
            ['რუსთაველის ფილიალი', 'რუსთაველის 36'],
            ['ვარკეთილის ფილიალი', 'ჯავახეთის 46'],
            ['გლდანის ფილიალი', 'ვეკუაას 17ა'],
            ['დიდუბის ფილიალი', 'ერისთავის 13'],
            ['დიდი დიღმის ფილიალი', 'მირიან მეფის 43'],
            ['ბახტრიონის ფილიალი', 'ბახტრიონის 7'],
            ['ქავთარაძის ფილიალი', 'ქავთარაძის 5'],
            ['ვაკის ფილიალი', 'ჭავჭავაძის 12'],
            ['რუსთავის ფილიალი', 'რუსთავი, შარტავას 9'],
            ['ზუგდიდის ფილიალი', 'ზუგდიდი, კოსტავას 9'],
            ['ქუთაისის ფილიალი', 'ქუთაისი, ფალიაშვილის 11'],
            ['ბათუმის ფილიალი', 'ბათუმი, ბაგრატიონის 156'],
            ['მთავარი საწყობი', 'თბილისი, გრიგოლ ლორთქიფანიძის ქუჩა'],
        ];

        $startDate = '2026-03-09';

        foreach ($projects as [$title, $address]) {
            Project::firstOrCreate(
                [
                    'workspace_id' => $workspaceId,
                    'title' => $title,
                ],
                [
                    'description' => $address,
                    'address' => $address,
                    'status' => 'active',
                    'priority' => 'high',
                    'start_date' => $startDate,
                    'deadline' => null,
                    'actual_hours' => 0,
                    'progress' => 0,
                    'is_public' => false,
                    'created_by' => $createdBy,
                ]
            );
        }
    }
}
