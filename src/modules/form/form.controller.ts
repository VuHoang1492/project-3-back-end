import { Controller, Get } from '@nestjs/common';
import { FormService } from './form.service';
import { Roles } from 'src/decorator/roles.decorator';
import { Role } from 'src/global/enum';

@Controller('form')
export class FormController {
    constructor(private readonly formSerice: FormService) { }



}
