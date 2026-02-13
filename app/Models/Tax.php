<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Tax extends BaseModel
{
    use HasFactory;

    protected $fillable = [
        'name',
        'rate',
        'is_inclusive',
        'workspace_id',
    ];

    protected $casts = [
        'rate' => 'float',
        'is_inclusive' => 'boolean',
    ];

    public function workspace()
    {
        return $this->belongsTo(Workspace::class);
    }
}