<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\ContractType;
use App\Models\Contract;
use App\Models\ContractNote;
use App\Models\ContractComment;
use App\Models\ContractAttachment;
use Carbon\Carbon;

class ContractSeeder extends Seeder
{
    public function run(): void
    {
        // Create Contract Types
        $contractTypes = [
            [
                'name' => 'Service Agreement',
                'description' => 'General service agreement contract',
                'color' => '#007bff',
                'is_active' => true,
                'sort_order' => 1,
            ],
            [
                'name' => 'Software Development',
                'description' => 'Software development contract',
                'color' => '#28a745',
                'is_active' => true,
                'sort_order' => 2,
            ],
            [
                'name' => 'Maintenance Contract',
                'description' => 'Ongoing maintenance and support contract',
                'color' => '#ffc107',
                'is_active' => true,
                'sort_order' => 3,
            ],
            [
                'name' => 'Consulting Agreement',
                'description' => 'Professional consulting services contract',
                'color' => '#17a2b8',
                'is_active' => true,
                'sort_order' => 4,
            ],
            [
                'name' => 'NDA',
                'description' => 'Non-disclosure agreement',
                'color' => '#6f42c1',
                'is_active' => true,
                'sort_order' => 5,
            ]
        ];

        $createdTypes = [];
        foreach ($contractTypes as $typeData) {
            $type = ContractType::updateOrCreate(
                ['name' => $typeData['name'], 'workspace_id' => 1],
                array_merge($typeData, [
                    'workspace_id' => 1,
                    'created_by' => 2
                ])
            );
            $createdTypes[] = $type;
        }

        // Use different client IDs based on SaaS mode
        $isSaas = config('app.is_saas', false);
        $clientId = $isSaas ? 21 : 20;
        $assignedUserId = $isSaas ? 21 : 20;

        // Create Contracts - matching database structure exactly
        $contracts = [
            [
                'contract_id' => 'CON-2025-0001',
                'subject' => 'Website Development Contract',
                'description' => 'Complete website development with modern design and functionality',
                'contract_type_id' => 1,
                'contract_value' => 15000.00,
                'start_date' => '2025-11-16',
                'end_date' => '2026-02-14',
                'status' => 'accept',
                'client_id' => $clientId,
                'project_id' => 1,
                'assigned_users' => [$assignedUserId],
                'terms_conditions' => 'Payment terms: 50% upfront, 50% on completion. All work to be completed within specified timeline.',
                'notes' => 'Client prefers modern design with responsive layout',
                'currency' => 'USD',
                'workspace_id' => 1,
            ],
            [
                'contract_id' => 'CON-2025-0002',
                'subject' => 'Mobile App Development Agreement',
                'description' => 'Native mobile application development for iOS and Android platforms',
                'contract_type_id' => 2,
                'contract_value' => 25000.00,
                'start_date' => '2025-12-21',
                'end_date' => '2026-04-15',
                'status' => 'sent',
                'client_id' => $clientId,
                'project_id' => 2,
                'assigned_users' => [$assignedUserId],
                'terms_conditions' => 'Milestone-based payments. Testing phase included. 3 months warranty.',
                'notes' => 'Requires integration with existing backend systems',
                'currency' => 'USD',
                'workspace_id' => 1,
            ],
            [
                'contract_id' => 'CON-2025-0003',
                'subject' => 'System Maintenance Contract',
                'description' => 'Ongoing system maintenance and support services',
                'contract_type_id' => 3,
                'contract_value' => 5000.00,
                'start_date' => '2025-12-16',
                'end_date' => '2026-12-16',
                'status' => 'pending',
                'client_id' => $clientId,
                'project_id' => 3,
                'assigned_users' => [$assignedUserId],
                'terms_conditions' => 'Monthly recurring payments. 24/7 support included. SLA guaranteed.',
                'notes' => 'Annual contract with renewal option',
                'currency' => 'USD',
                'workspace_id' => 1,
            ],
            [
                'contract_id' => 'CON-2025-0004',
                'subject' => 'Consulting Services Agreement',
                'description' => 'Technical consulting and advisory services',
                'contract_type_id' => 4,
                'contract_value' => 8000.00,
                'start_date' => '2025-12-06',
                'end_date' => '2026-02-04',
                'status' => 'accept',
                'client_id' => $clientId,
                'project_id' => 4,
                'assigned_users' => [$assignedUserId],
                'terms_conditions' => 'Hourly billing. Weekly reports required. Confidentiality agreement included.',
                'notes' => 'Focus on system architecture and performance optimization',
                'currency' => 'USD',
                'workspace_id' => 1,
            ],
            [
                'contract_id' => 'CON-2025-0005',
                'subject' => 'Non-Disclosure Agreement',
                'description' => 'Confidentiality agreement for proprietary information sharing',
                'contract_type_id' => 5,
                'contract_value' => 0.00,
                'start_date' => '2025-10-17',
                'end_date' => '2027-12-16',
                'status' => 'accept',
                'client_id' => $clientId,
                'project_id' => null,
                'assigned_users' => [$assignedUserId],
                'terms_conditions' => 'Mutual non-disclosure. 2-year validity. Covers all business communications.',
                'notes' => 'Standard NDA template used',
                'currency' => 'USD',
                'workspace_id' => 1,
            ]
        ];

        $createdContracts = [];
        foreach ($contracts as $contractData) {
            $contract = Contract::updateOrCreate(
                ['contract_id' => $contractData['contract_id']],
                array_merge($contractData, ['created_by' => 2])
            );
            $createdContracts[] = $contract;
        }

        // Create Contract Notes
        $notes = [
            'Initial requirements discussed with client',
            'Design mockups approved by client',
            'Development phase started',
            'Client requested additional features',
            'Testing phase completed successfully',
            'Final delivery scheduled for next week'
        ];

        foreach ($createdContracts as $contract) {
            for ($i = 0; $i < rand(2, 4); $i++) {
                ContractNote::create([
                    'contract_id' => $contract->id,
                    'note' => $notes[array_rand($notes)],
                    'is_pinned' => rand(0, 1) ? true : false,
                    'created_by' => 2,
                ]);
            }
        }

        // Create Contract Comments
        $comments = [
            'Please review the updated terms and conditions',
            'Client has approved the milestone deliverables',
            'Need to schedule a meeting to discuss next phase',
            'Payment received for the first milestone',
            'All technical requirements have been clarified',
            'Contract is ready for client signature'
        ];

        foreach ($createdContracts as $contract) {
            for ($i = 0; $i < rand(1, 3); $i++) {
                ContractComment::create([
                    'contract_id' => $contract->id,
                    'comment' => $comments[array_rand($comments)],
                    'parent_id' => null,
                    'is_internal' => rand(0, 1) ? true : false,
                    'created_by' => 2,
                ]);
            }
        }

        // Create Contract Attachments
        $attachmentFiles = [
            'contract_template.pdf',
            'project_requirements.docx',
            'technical_specifications.pdf',
            'design_mockups.zip',
            'signed_agreement.pdf'
        ];

        foreach ($createdContracts as $contract) {
            if (rand(0, 1)) {
                ContractAttachment::create([
                    'workspace_id' => 1,
                    'contract_id' => $contract->id,
                    'files' => $attachmentFiles[array_rand($attachmentFiles)],
                ]);
            }
        }
    }
}