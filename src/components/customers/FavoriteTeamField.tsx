import { useState } from 'react'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Check, ChevronsUpDown, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'

// Lista inicial de times
const initialTeams = [
  'CORINTHIANS',
  'PALMEIRAS',
  'SAO PAULO',
  'SANTOS',
  'FLAMENGO',
  'FLUMINENSE',
  'VASCO',
  'BOTAFOGO',
  'GREMIO',
  'INTERNACIONAL',
  'CRUZEIRO',
  'ATLETICO-MG'
]

interface FavoriteTeamFieldProps {
  value: string
  onChange: (value: string) => void
}

export function FavoriteTeamField({
  value,
  onChange
}: FavoriteTeamFieldProps) {
  const [open, setOpen] = useState(false)
  const [teams, setTeams] = useState(initialTeams)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [newTeam, setNewTeam] = useState('')

  // Função para formatar o texto (maiúsculo e sem acentos)
  const formatText = (text: string) => {
    return text
      .toUpperCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
  }

  // Adicionar novo time
  const handleAddTeam = () => {
    if (newTeam) {
      const formattedTeam = formatText(newTeam)
      if (!teams.includes(formattedTeam)) {
        setTeams([...teams, formattedTeam].sort())
        onChange(formattedTeam)
      }
      setNewTeam('')
      setDialogOpen(false)
    }
  }

  return (
    <div className="flex gap-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            {value
              ? teams.find((team) => team === value)
              : 'Selecione o time...'}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0">
          <Command>
            <CommandInput placeholder="Buscar time..." />
            <CommandEmpty>Time não encontrado.</CommandEmpty>
            <CommandGroup>
              {teams.map((team) => (
                <CommandItem
                  key={team}
                  onSelect={() => {
                    onChange(team)
                    setOpen(false)
                  }}
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      value === team ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  {team}
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="icon">
            <Plus className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Novo Time</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="team">Nome do Time</Label>
              <Input
                id="team"
                value={newTeam}
                onChange={(e) => setNewTeam(e.target.value)}
                placeholder="Digite o nome do time..."
              />
            </div>
            <Button
              onClick={handleAddTeam}
              disabled={!newTeam}
              className="w-full"
            >
              Adicionar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
