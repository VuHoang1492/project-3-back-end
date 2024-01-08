import { Body, Controller, Post, Request, UploadedFile, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { Roles } from 'src/decorator/roles.decorator';
import { Role } from 'src/global/enum';
import { PostService } from './post.service';

@Controller('post')
export class PostController {
    constructor(private readonly postService: PostService) { }
    @Post('/create')
    @UseInterceptors(FilesInterceptor('media'))
    @Roles(Role.OWNER)
    async createPost(@Body() payload, @UploadedFiles() files: Array<Express.Multer.File>, @Request() req) {
        return this.postService.createPost(files, req.userId, payload)

    }
}
